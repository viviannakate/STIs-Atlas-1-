# Publishing the STI Atlas dashboard — step-by-step

You do **not** need the command line. Pick **Option A** (drag-and-drop, nothing to
install) or **Option C** (GitHub Desktop, clicks). Option B is git for completeness.

Your repo: **https://github.com/viviannakate/STIs-Atlas**
Your live URL (after publishing): **https://viviannakate.github.io/STIs-Atlas/**

---

## ⭐ Option A — Upload on the GitHub website (no install)

The dashboard only needs the **`docs`** folder, so this is all it takes.

1. **Unzip** the download. You'll have a `sti_project` folder.
2. Go to **https://github.com/viviannakate/STIs-Atlas**.
3. Click **Add file → Upload files**.
4. Open the unzipped `sti_project` folder, and **drag the `docs` folder** into the
   upload area on GitHub. Wait for every file to finish listing (the map data and the
   vendored libraries are a few MB — give it a moment).
5. In the "Commit changes" box type `Add dashboard` and click **Commit changes**.
6. Optional but nice: repeat step 3–5 and drag in `README.md`, the `real` folder,
   `figures`, and `tables` so the whole project is on GitHub. (Not required for the
   site to work.)

Now skip to **“Enable GitHub Pages”** below.

> The website uploader sometimes refuses a folder named `.github`. You don't need it
> for Option A, because the Pages method below serves the `/docs` folder directly.

---

## Option C — GitHub Desktop (clicks, no terminal)

1. Install **GitHub Desktop** from https://desktop.github.com and sign in as `viviannakate`.
2. **File → Add local repository → Choose…** and select the unzipped `sti_project` folder.
   If prompted, click **“create a repository”**, then **Create repository**.
3. Bottom-left: type `Real state-level dashboard` and click **Commit to main**.
4. **Repository → Repository settings → Remote**, set the URL to
   `https://github.com/viviannakate/STIs-Atlas.git`, then click **Push origin** (top).

Then **“Enable GitHub Pages”** below.

---

## Option B — Git command line (only if you prefer it)

```bash
cd sti_project
git init
git remote add origin https://github.com/viviannakate/STIs-Atlas.git
git add .
git commit -m "Real state-level dashboard, ages 15-29"
git branch -M main
git push -f origin main
```
Username = `viviannakate`; password = a **personal access token** (github.com/settings/tokens
→ Generate new token (classic) → check `repo`).

---

## Enable GitHub Pages  (same for every option)

1. In the repo, go to **Settings → Pages**.
2. Under **Build and deployment → Source**, choose **Deploy from a branch**.
3. Branch: **main**  ·  Folder: **/docs**  ·  click **Save**.
4. Wait ~1 minute, refresh the page — GitHub shows the live link at the top:
   **https://viviannakate.github.io/STIs-Atlas/**

That's it — the dashboard is live. Every time you re-upload the `docs` folder, the site updates.

---

## Quick checks if the map looks blank

- Confirm the repo has a **`docs`** folder containing `index.html` and an `assets` folder
  (with `states.geojson`, `state_rates.json`, and a `vendor` folder).
- Give it a minute after enabling Pages the first time.
- Don't open `index.html` from your computer by double-clicking — it only works when
  served by GitHub Pages (or a local server).
