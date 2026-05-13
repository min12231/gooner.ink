const express = require("express");
                        {
                            name: "IP Address",
                            value: `\`${ip}\``,
                            inline: false
                        },
                        {
                            name: "User Agent",
                            value: `\`${userAgent}\``,
                            inline: false
                        },
                        {
                            name: "Time",
                            value: new Date().toLocaleString(),
                            inline: false
                        }
                    ]
                }
            ]
        });
    } catch (err) {
        console.error("Failed to send webhook:", err.message);
    }
}

// Middleware
app.use(async (req, res, next) => {
    const ip = getClientIP(req);

    // Block banned IPs
    if (bannedIPs.has(ip)) {
        return res.status(403).send(`
            <h1>Access Denied</h1>
            <p>Your IP has been banned.</p>
        `);
    }

    const userAgent = req.headers["user-agent"] || "Unknown";

    console.log(`Visitor IP: ${ip}`);

    await sendToDiscord(ip, userAgent);

    next();
});

// Serve static website
app.use(express.static(path.join(__dirname, "public")));

// API route to ban IPs manually
app.get("/ban/:ip", (req, res) => {
    const ipToBan = req.params.ip;

    bannedIPs.add(ipToBan);

    console.log(`Banned IP: ${ipToBan}`);

    res.send(`IP ${ipToBan} banned successfully.`);
});

// API route to unban IPs manually
app.get("/unban/:ip", (req, res) => {
    const ipToUnban = req.params.ip;

    bannedIPs.delete(ipToUnban);

    console.log(`Unbanned IP: ${ipToUnban}`);

    res.send(`IP ${ipToUnban} unbanned successfully.`);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
