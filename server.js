import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import nodemailer from "nodemailer";

const rootDirectory = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 3000);
const allowedOrigin = process.env.SITE_ORIGIN || `http://localhost:${port}`;
const recipient = process.env.MAIL_TO || "info@thelunchboxfund.co.za";
const maximumBodyBytes = 10 * 1024;
const rateLimitWindowMs = 15 * 60 * 1000;
const rateLimitMaximum = 5;
const requestsByAddress = new Map();

const requiredMailSettings = ["SMTP_HOST", "SMTP_USER", "SMTP_PASS", "MAIL_FROM"];
const missingMailSettings = requiredMailSettings.filter((setting) => !process.env[setting]);

if (missingMailSettings.length > 0) {
    throw new Error(`Missing required mail settings: ${missingMailSettings.join(", ")}`);
}

const siteOrigin = new URL(allowedOrigin);
if (!["http:", "https:"].includes(siteOrigin.protocol)) {
    throw new Error("SITE_ORIGIN must use HTTP or HTTPS.");
}

const smtpPort = Number(process.env.SMTP_PORT || 587);
const mailTransport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: smtpPort,
    secure: process.env.SMTP_SECURE === "true" || smtpPort === 465,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

const publicFiles = new Map([
    ["/", "index.html"],
    ["/index.html", "index.html"],
    ["/about.html", "about.html"],
    ["/programs.html", "programs.html"],
    ["/donate.html", "donate.html"],
    ["/contact.html", "contact.html"],
    ["/enquiry.html", "enquiry.html"],
    ["/myscript.js", "myscript.js"],
    ["/css_assets/style.css", "css_assets/style.css"],
    ["/images/lunchbox-fund-logo.png", "images/lunchbox-fund-logo.png"],
    ["/images/community-school-meal-service-khalil-radi.jpg", "images/community-school-meal-service-khalil-radi.jpg"],
    ["/images/schoolchildren-together-bennett-tobias.jpg", "images/schoolchildren-together-bennett-tobias.jpg"],
    ["/images/learning-community-classroom-rewired-digital.jpg", "images/learning-community-classroom-rewired-digital.jpg"],
    ["/images/lunchbox-fund-community-support.jpeg", "images/lunchbox-fund-community-support.jpeg"],
    ["/images/lunchbox-fund-school-meals-hero.png", "images/lunchbox-fund-school-meals-hero.png"]
]);

const contentTypes = new Map([
    [".html", "text/html; charset=utf-8"],
    [".css", "text/css; charset=utf-8"],
    [".js", "text/javascript; charset=utf-8"],
    [".jpg", "image/jpeg"],
    [".jpeg", "image/jpeg"],
    [".png", "image/png"]
]);

const messageTypes = new Set([
    "General question",
    "School feeding programs",
    "Donation or fundraising",
    "Volunteering",
    "Sponsorship or partnership",
    "Other"
]);

const enquiryTypes = new Map([
    ["program", "A school feeding program"],
    ["volunteer", "Volunteering"],
    ["sponsor", "Sponsorship or partnership"],
    ["general", "Something else"]
]);

const allowedChoices = {
    programInterest: new Set(["School Feeding", "Community Outreach", "Advocacy and Awareness", "Not sure yet"]),
    volunteerInterest: new Set(["School or community support", "Fundraising", "Communications and awareness", "Other skills"]),
    sponsorInterest: new Set(["Financial sponsorship", "Food or supplies", "Business partnership", "Not sure yet"])
};

const setSecurityHeaders = (response) => {
    response.setHeader("X-Content-Type-Options", "nosniff");
    response.setHeader("X-Frame-Options", "DENY");
    response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    response.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    response.setHeader(
        "Content-Security-Policy",
        "default-src 'self'; script-src 'self' https://unpkg.com; style-src 'self' 'unsafe-inline' https://unpkg.com; img-src 'self' data: https://*.tile.openstreetmap.org; connect-src 'self'; font-src 'self' data:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'"
    );
};

const sendJson = (response, statusCode, data) => {
    response.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
    response.end(JSON.stringify(data));
};

const readJsonBody = async (request) => {
    let size = 0;
    const chunks = [];

    for await (const chunk of request) {
        size += chunk.length;
        if (size > maximumBodyBytes) {
            const error = new Error("Your message is too large. Please shorten it and try again.");
            error.statusCode = 413;
            throw error;
        }
        chunks.push(chunk);
    }

    try {
        return JSON.parse(Buffer.concat(chunks).toString("utf8"));
    } catch {
        const error = new Error("The form data could not be read. Please refresh the page and try again.");
        error.statusCode = 400;
        throw error;
    }
};

const cleanText = (value) => typeof value === "string"
    ? value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim()
    : "";

const validateSubmission = (data) => {
    if (!data || typeof data !== "object" || Array.isArray(data)) {
        return { error: "Please submit a valid form." };
    }

    if (cleanText(data.website)) {
        return { spam: true };
    }

    const name = cleanText(data.name).replace(/[\r\n]/g, " ");
    const email = cleanText(data.email);
    const phone = cleanText(data.phone);
    const message = cleanText(data.message);

    if (name.length < 2 || name.length > 80) {
        return { error: "Enter a name between 2 and 80 characters." };
    }
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return { error: "Enter a valid email address." };
    }
    if (message.length < 10 || message.length > 2000) {
        return { error: "Write a message between 10 and 2,000 characters." };
    }
    if (phone && (!/^[+0-9(). -]+$/.test(phone) || (phone.match(/\d/g) || []).length < 7 || (phone.match(/\d/g) || []).length > 15)) {
        return { error: "Enter a valid phone number using 7 to 15 digits." };
    }

    if (data.formType === "contact") {
        const messageType = cleanText(data.messageType);
        if (!messageTypes.has(messageType)) {
            return { error: "Choose a valid type of message." };
        }

        return {
            submission: {
                subject: `Website contact: ${messageType}`,
                lines: [
                    "General contact message",
                    `Name: ${name}`,
                    `Email: ${email}`,
                    `Phone: ${phone || "Not provided"}`,
                    `Message type: ${messageType}`,
                    `Message: ${message}`
                ]
            }
        };
    }

    if (data.formType === "enquiry") {
        const enquiryType = cleanText(data.enquiryType);
        const topic = enquiryTypes.get(enquiryType);
        if (!topic) {
            return { error: "Choose a valid enquiry topic." };
        }

        const interestField = {
            program: "programInterest",
            volunteer: "volunteerInterest",
            sponsor: "sponsorInterest"
        }[enquiryType];
        const interest = interestField ? cleanText(data[interestField]) : "";
        if (interestField && !allowedChoices[interestField].has(interest)) {
            return { error: "Choose an option for the enquiry topic you selected." };
        }

        const preferredStartDate = cleanText(data.preferredStartDate);
        if (preferredStartDate) {
            const parsedDate = new Date(`${preferredStartDate}T00:00:00Z`);
            const todayInSouthAfrica = new Intl.DateTimeFormat("en-CA", {
                timeZone: "Africa/Johannesburg"
            }).format(new Date());
            if (!/^\d{4}-\d{2}-\d{2}$/.test(preferredStartDate)
                || Number.isNaN(parsedDate.getTime())
                || parsedDate.toISOString().slice(0, 10) !== preferredStartDate) {
                return { error: "Choose a valid start date that is today or later." };
            }
            if (preferredStartDate < todayInSouthAfrica) {
                return { error: "Choose a valid start date that is today or later." };
            }
        }

        return {
            submission: {
                subject: `Website enquiry: ${topic}`,
                lines: [
                    "Program, volunteer, or sponsor enquiry",
                    `Name: ${name}`,
                    `Email: ${email}`,
                    `Phone: ${phone || "Not provided"}`,
                    `Enquiry type: ${topic}`,
                    ...(interest ? [`Area of interest: ${interest}`] : []),
                    ...(preferredStartDate ? [`Preferred start date: ${preferredStartDate}`] : []),
                    `Message: ${message}`
                ]
            }
        };
    }

    return { error: "The form type is not recognized. Please refresh the page and try again." };
};

const isRateLimited = (address) => {
    const now = Date.now();
    const previous = requestsByAddress.get(address);
    if (!previous || now - previous.startedAt >= rateLimitWindowMs) {
        requestsByAddress.set(address, { startedAt: now, count: 1 });
        return false;
    }

    previous.count += 1;
    return previous.count > rateLimitMaximum;
};

const sendSubmission = async (submission, email) => {
    await mailTransport.sendMail({
        from: process.env.MAIL_FROM,
        to: recipient,
        replyTo: email,
        subject: submission.subject,
        text: submission.lines.join("\n\n")
    });
};

const serveFile = async (request, response, fileName) => {
    const fullPath = path.join(rootDirectory, fileName);
    const file = await readFile(fullPath);
    const extension = path.extname(fullPath).toLowerCase();
    response.writeHead(200, {
        "Content-Type": contentTypes.get(extension) || "application/octet-stream",
        "Cache-Control": extension === ".html" ? "no-cache" : "public, max-age=3600"
    });
    response.end(request.method === "HEAD" ? undefined : file);
};

const server = createServer(async (request, response) => {
    setSecurityHeaders(response);

    const requestUrl = new URL(request.url, allowedOrigin);
    if (request.method === "GET" && requestUrl.pathname === "/health") {
        sendJson(response, 200, { status: "ok" });
        return;
    }

    if (requestUrl.pathname === "/api/contact" && request.method === "POST") {
        if (request.headers.origin !== siteOrigin.origin) {
            sendJson(response, 403, { message: "This form can only be sent from the Lunchbox Fund website." });
            return;
        }

        const contentType = request.headers["content-type"]?.split(";")[0].trim().toLowerCase();
        if (contentType !== "application/json") {
            sendJson(response, 415, { message: "The form could not be read. Please refresh the page and try again." });
            return;
        }

        if (isRateLimited(request.socket.remoteAddress || "unknown")) {
            sendJson(response, 429, { message: "Too many messages were sent from this connection. Please wait a little while and try again." });
            return;
        }

        try {
            const data = await readJsonBody(request);
            const validation = validateSubmission(data);

            if (validation.spam) {
                sendJson(response, 202, { message: "Thank you. Your message has been received." });
                return;
            }
            if (validation.error) {
                sendJson(response, 400, { message: validation.error });
                return;
            }

            await sendSubmission(validation.submission, cleanText(data.email));
            sendJson(response, 200, { message: "Your message has been sent. The team will reply using the email address you provided." });
        } catch (error) {
            if (error.statusCode) {
                sendJson(response, error.statusCode, { message: error.message });
                return;
            }

            console.error("Email delivery failed.");
            sendJson(response, 502, { message: "We could not deliver your message right now. Please try again later." });
        }
        return;
    }

    if (request.method !== "GET" && request.method !== "HEAD") {
        sendJson(response, 405, { message: "This request method is not supported." });
        return;
    }

    const fileName = publicFiles.get(requestUrl.pathname);
    if (!fileName) {
        response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
        response.end("Not found");
        return;
    }

    try {
        await serveFile(request, response, fileName);
    } catch {
        response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
        response.end("Not found");
    }
});

server.listen(port, "0.0.0.0", () => {
    console.log(`Lunchbox Fund website listening on port ${port}.`);
});
