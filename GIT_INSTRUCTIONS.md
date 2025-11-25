# Git Setup Instructions

I have started the installation of Git on your system. Please follow these steps:

1.  **Approve Installation**: If you see a User Account Control (UAC) prompt asking for permission to make changes, please click **Yes**.
2.  **Wait for Completion**: Wait for the installation to finish.
3.  **Restart Terminal**: **IMPORTANT**: You MUST close and reopen your terminal (or restart VS Code) for the changes to take effect. The `git` command will not work until you do this.

## After Restarting

Once you have restarted your terminal, run the following commands in your project folder (`c:\Users\Asus\Documents\tattva`) to initialize your repository and push your code:

```bash
# 1. Initialize the repository
git init

# 2. Add all files
git add .

# 3. Commit the changes
git commit -m "Initial commit"

# 4. Link to your remote repository (Replace <YOUR_REPO_URL> with your actual GitHub/GitLab URL)
# Example: git remote add origin https://github.com/yourusername/tattva.git
git remote add origin <YOUR_REPO_URL>

# 5. Push your code
git push -u origin main
```

If you don't have a repository URL yet, go to GitHub/GitLab, create a new empty repository, and copy the URL.
