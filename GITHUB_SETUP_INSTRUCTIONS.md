# GitHub Repository Setup Instructions for Telnyx Links

## Step 1: Create a GitHub Account (if you don't have one)
1. Go to https://github.com
2. Click "Sign up"
3. Follow the registration process

## Step 2: Create a New Repository on GitHub

1. **Login to GitHub** and click the **"+"** icon in the top right corner
2. Select **"New repository"**
3. Fill in the repository details:
   - **Repository name:** `telnyx-links`
   - **Description:** "Browser extension for selecting and opening multiple links with customizable keyboard shortcuts"
   - **Visibility:** Choose Public or Private
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
4. Click **"Create repository"**

## Step 3: Connect Your Local Repository to GitHub

After creating the repository, GitHub will show you a page with instructions. Since we already have a local repository with commits, use these commands:

### Option A: Using HTTPS (Easier for beginners)

Open Git Bash or Command Prompt in your project folder and run:

```bash
cd "C:\Users\tonyr\Documents\AI Projects\Telnyx Links"
git remote add origin https://github.com/YOUR_USERNAME/telnyx-links.git
git push -u origin main
```

You'll be prompted for your GitHub username and password (use a Personal Access Token instead of password).

### Option B: Using SSH (More secure, requires SSH key setup)

```bash
cd "C:\Users\tonyr\Documents\AI Projects\Telnyx Links"
git remote add origin git@github.com:YOUR_USERNAME/telnyx-links.git
git push -u origin main
```

## Step 4: Creating a Personal Access Token (for HTTPS)

If using HTTPS, GitHub requires a Personal Access Token instead of your password:

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click **"Generate new token"** → "Generate new token (classic)"
3. Give it a name like "Telnyx Links Push"
4. Select scopes: `repo` (full control of private repositories)
5. Click **"Generate token"**
6. **COPY THE TOKEN NOW** (you won't see it again!)
7. Use this token as your password when pushing

## Step 5: Verify Your Repository

1. Go to `https://github.com/YOUR_USERNAME/telnyx-links`
2. You should see all your files uploaded
3. The README.md should be displayed automatically

## Current Repository Status

✅ Git repository initialized  
✅ All files added and committed  
✅ Ready to push to GitHub  

Your local repository has these files ready:
- Extension source code (JS, HTML, CSS)
- Icons (PNG format)
- README documentation
- .gitignore file

## Common Commands for Future Updates

```bash
# Check status
git status

# Add changes
git add .

# Commit changes
git commit -m "Your commit message"

# Push to GitHub
git push

# Pull latest changes
git pull
```

## Troubleshooting

### "Support for password authentication was removed"
- You need to use a Personal Access Token (see Step 4)

### "Permission denied (publickey)"
- You need to set up SSH keys or use HTTPS instead

### "Updates were rejected"
- Run `git pull` first to get latest changes, then push again

### "Not a git repository"
- Make sure you're in the correct folder: `C:\Users\tonyr\Documents\AI Projects\Telnyx Links`

## Next Steps

After pushing to GitHub, you can:
1. **Add a LICENSE file** (MIT recommended for open source)
2. **Enable GitHub Pages** to create a landing page
3. **Set up GitHub Actions** for automated testing
4. **Add badges** to your README
5. **Create releases** for version management

## Need Help?

- GitHub Docs: https://docs.github.com
- Git Basics: https://git-scm.com/book/en/v2/Getting-Started-Git-Basics
- Personal Access Tokens: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token

---

Remember to replace `YOUR_USERNAME` with your actual GitHub username in all commands!