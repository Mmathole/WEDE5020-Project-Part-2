# WEDE5020-Project-Part-2
* *Name: Mmathole Ramaboea*
* *Student no: ST10505573*
* *Group no: 3*

  ### Website Goals and Objectives
The websites main goals and objectives are to:
1.	Raise awareness 
•	By educating people about child hunger and the importance of child nutrition in schools.
•	Sharing stories and reports on the impact and the work of the organisation.
2.	Encourage donations and fundraising
•	By providing a clear, simple, secure and transparent online donation system for people.
3.	Engage with its supporters
•	Make it easy for people to contact and support the organisation and bring forth any queries they may have.
•	Create opportunities for volunteers and donors to get involved.
4.	Measure the organisations success
•	Tracking the number of donations that were made online and monitoring website traffic.
5.	Ensuring that the website is easily accessible and easy to navigate for all users
•	Use clear menus and layouts for quick access to information.

### Key Features and Functionality
•	The Homepage includes statistics on their impact and donation.
•	About Us – includes history, mission and patron
•	Why nutrition – educates viewers on the importance of nutrition in school children.
•	Mission – Gives users a better understanding if the organization

### Timeline and Milestones
Stage	Activity
Day 1 - 2	Research on The Lunchbox fund and analysis of the website and develop starting point of website proposal
Day 3	Gather information and content
Day 4	Create a sitemap and wireframes
Day 5-6	Create HTML pages and add information and content
Day 7	Test, debug and finalize documentation and submission

### Sitemap
Home Page
├── About
│   ├── History (Founded 2005 by Topaz Page-Green)
│   ├── Mission & Vision (Uphold children's right to education by ensuring hunger is not an issue)
│   └── Team
├── Enquiries
│   ├── Ways to volunteer
│   └── Contact information
├── Programs
└── Contact
└── Contact Information
├── Email: info@thelunchboxfund.org
└── Phone: +27793660884

  ### References
-	The Lunchbox Fund [online]  Available at: < https://www.thelunchboxfund.org/ > [Accessed 08 August 2026]
-	Wikipedia, The Lunchbox Fund [online]. Available at: < https://en.wikipedia.org/wiki/The_Lunchbox_Fund > [ Accessed 08 August 2026]
-	 Lunchbox Fund, 2019. 2019 Annual Report – Webflow [online] Available at: < https://uploads-ssl.webflow.com/5dc9b504aa4ac344e9872359/602eb3cbf7b7a10799f565e6_Lunchbox%20Fund%20Annual%20Report%202019.pdf >
-	The BorgenProject, 2018. Feedie and the Lunchbox Fund Fight Childhood Hunger in South Africa [online] Available at: < https://borgenproject.org/childhood-hunger-in-south-africa/ >
-	Lunchbox Fund, 2019. 2019 Annual Report [online] Available at: < https://uploads-ssl.webflow.com/5dc9b504aa4ac344e9872359/602eb3cbf7b7a10799f565e6_Lunchbox%20Fund%20Annual%20Report%202019.pdf >

Budget
-	Lunchbox Fund, 2024. 2024 Annual Report [online] Available at: < https://cdn.prod.website-files.com/5dcafdbe4d247f4aa384ee99/68ded0b86e8042ab45408dcb_Lunchbox%20Fund%202024%20Annual%20Report.pdf >
-	Lunchbox Fund, 2025. 2025 Annual Report [online] Available at: < https://cdn.prod.website-files.com/5dcafdbe4d247f4aa384ee99/6a0fc1d223631697a33abe27_Lunchbox%20Fund%20Annual%20Report%202025.pdf >

## Changelog

- add more comments to HTML files
- improve file and folder structure
- delete unnecessary and unused file (New Folder, js_assets)
- create folder named: Private (Proposals)
- move proposals, sitemap, content research and sourcing files to Private (Proposals) folder
- complete navigation menu
- add content in donate.html

## Contact and enquiry form service

When the site runs with its Node.js server, the contact and enquiry forms submit
in the background to `/api/contact`. The server validates the fields again and
sends the message using Nodemailer. GitHub Pages cannot run that server; its
forms open a pre-filled email draft instead, as described below.

### Local setup

1. Install Node.js 20 or newer.
2. From the project folder, run `npm install`.
3. Configure the mail settings in the terminal before starting the server. In
   PowerShell, use your mail provider's values:

   ```powershell
   $env:SMTP_HOST = "smtp.example.org"
   $env:SMTP_PORT = "587"
   $env:SMTP_USER = "your-smtp-user"
   $env:SMTP_PASS = "your-smtp-password"
   $env:MAIL_FROM = "website@example.org"
   $env:SITE_ORIGIN = "http://localhost:3000"
   npm start
   ```

   `SMTP_SECURE` is optional; use `"true"` if your provider requires implicit
   TLS. `MAIL_TO` optionally overrides the recipient address. Keep real
   credentials out of source control.
4. Open `http://localhost:3000`. Visit `/health` to check that the server is
   responding.

Production hosting that sends form emails directly must run this Node.js server
(or an equivalent serverless endpoint) and set `SITE_ORIGIN` to the exact public
site origin. Configure SMTP credentials through the hosting provider's
secret/environment-variable settings; successful delivery also depends on the
SMTP provider allowing the configured sender.

## Publish the static website with GitHub Pages

The workflow in `.github/workflows/pages.yml` publishes the public pages when
changes are pushed to `main`. It copies only the HTML pages, stylesheet,
browser script, crawler files, and optimized images into the Pages artifact.
Project documents, proposals, source server code, and mail configuration are
not published.

1. Push the repository to GitHub.
2. In the repository, open **Settings → Pages** and select **GitHub Actions**
   as the build and deployment source.
3. Push a commit to `main`, or run **Deploy static website to GitHub Pages**
   from the **Actions** tab. Wait for the workflow's build and deploy jobs to
   complete.
4. Open `https://mmathole.github.io/WEDE5020-Project-Part-2/` and check its
   pages, `robots.txt`, and `sitemap.xml`. The repository owner or a custom
   domain change requires updating the canonical links, sitemap, and robots
   sitemap address.

GitHub Pages is static hosting; it cannot run `server.js` or Nodemailer. On the
Pages version, submitting a contact or enquiry form opens a pre-filled draft in
the visitor's email application. The visitor must review and send that draft.
For server-side email submission, use the local Node.js service or deploy an
authorized backend separately.

The Pages workflow publishes from an explicit file allowlist, which is the main
protection against accidentally exposing private project materials. The
included `robots.txt` gives crawlers guidance but is not access control. On a
`github.io` project site, search engines may only honor robots rules served at
the host root; use your own domain or its root Pages site if you need a
site-specific robots policy. GitHub Pages also does not let this repository set
HTTP security headers, so the public pages use a restrictive Content Security
Policy meta tag where supported.

  ## Screenshot evidence
  ### Desktop
  <img width="1887" height="942" alt="image" src="https://github.com/user-attachments/assets/f09fe075-a2ff-4c2a-a1da-daf1fd1f0d88" />
  <img width="1902" height="942" alt="image" src="https://github.com/user-attachments/assets/62426f28-52f9-46cf-b0a2-f2a785090161" />
  <img width="1891" height="686" alt="image" src="https://github.com/user-attachments/assets/8101575c-c726-4a9d-8d70-3b6331421404" />

  ### Mobile
  <img width="739" height="1600" alt="mobile 1" src="https://github.com/user-attachments/assets/9bc1d0da-a917-41b9-85e7-8d07c410667b" />
  <img width="739" height="1600" alt="mobile 4" src="https://github.com/user-attachments/assets/4b36ae10-3985-40f1-8fac-b4515db7af6a" />
  <img width="739" height="1600" alt="mobile 3" src="https://github.com/user-attachments/assets/86aecb61-b77b-42a9-8add-8a4e0f46a6f1" />

  






### References (updated)
  Organization overview & Website goals and objectives
-	The Lunchbox Fund [online]  Available at: < https://www.thelunchboxfund.org/ > [Accessed 08 August 2026]
-	Wikipedia, The Lunchbox Fund [online]. Available at: < https://en.wikipedia.org/wiki/The_Lunchbox_Fund > [ Accessed 08 August 2026]
-	 Lunchbox Fund, 2019. 2019 Annual Report – Webflow [online] Available at: < https://uploads-ssl.webflow.com/5dc9b504aa4ac344e9872359/602eb3cbf7b7a10799f565e6_Lunchbox%20Fund%20Annual%20Report%202019.pdf >
-	The BorgenProject, 2018. Feedie and the Lunchbox Fund Fight Childhood Hunger in South Africa [online] Available at: < https://borgenproject.org/childhood-hunger-in-south-africa/ >
-	Lunchbox Fund, 2019. 2019 Annual Report [online] Available at: < https://uploads-ssl.webflow.com/5dc9b504aa4ac344e9872359/602eb3cbf7b7a10799f565e6_Lunchbox%20Fund%20Annual%20Report%202019.pdf >

Budget
-	Lunchbox Fund, 2024. 2024 Annual Report [online] Available at: < https://cdn.prod.website-files.com/5dcafdbe4d247f4aa384ee99/68ded0b86e8042ab45408dcb_Lunchbox%20Fund%202024%20Annual%20Report.pdf >
-	Lunchbox Fund, 2025. 2025 Annual Report [online] Available at: < https://cdn.prod.website-files.com/5dcafdbe4d247f4aa384ee99/6a0fc1d223631697a33abe27_Lunchbox%20Fund%20Annual%20Report%202025.pdf >

-	<img width="685" height="501" alt="image" src="https://github.com/user-attachments/assets/fe99ec7a-a9b4-4585-bbce-6c57691dff68" />

<img width="807" height="782" alt="image" src="https://github.com/user-attachments/assets/dad1d911-378f-4b6f-bf5c-0a45e641af4f" />


-	Google. 2026. The Lunchbox Fund logo drawing on dark green background [Generative AI image]. Gemini (September 2026 version). Prompted by user. [Accessed 17 September 2026]. Available from: https://gemini.google.com
-	Figure 1: The Lunchbox Fund logo drawing

Source: Image generated by Google Gemini on a dark forest green background using the prompt: "make the background match this [green] color" based on an original generation for "a logo of a non profit org called The Lunchbox Fund, logo must contain hands holding and a lunchbox" (Google, 2026).


	
