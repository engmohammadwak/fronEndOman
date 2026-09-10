import subprocess
from colorama import Fore, Style, init

# تشغيل الألوان
init(autoreset=True)

def run_cmd(cmd, capture=False):
    if capture:
        res = subprocess.run(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        return res.returncode, res.stdout.strip()
    return subprocess.run(cmd, shell=True).returncode

# فحص سريع لبيانات الحساب قبل الرفع لتجنب رفض GitHub
def check_git_config():
    _, email = run_cmd("git config user.email", capture=True)
    if not email:
        mail = input(Fore.YELLOW + "📧 أدخل إيميلك في GitHub (أو noreply): ").strip()
        if mail:
            run_cmd(f'git config --global user.email "{mail}"')

# ==============================
# Header
# ==============================

print(Fore.CYAN + "=" * 55)
print(Fore.YELLOW + "🚀 Git Manager - macOS")
print(Fore.CYAN + "=" * 55)

print(Fore.GREEN + "1️⃣  Upload to GitHub")
print(Fore.BLUE + "2️⃣  Download from GitHub")
print(Fore.RED + "3️⃣  Reset Git & Force Upload")

print(Fore.CYAN + "=" * 55)

# ==============================
# اختيار المستخدم
# ==============================

choice = input(
    Fore.MAGENTA + "👉 Choose (1/2/3): "
    + Style.RESET_ALL
).strip()

commands = []
title = ""

# ==============================
# 1. Upload
# ==============================
if choice == "1":
    check_git_config()
    
    commands.append("git status")
    
    # فحص إذا كان هناك تعديلات جديدة لعمل Commit دون توقف السكربت بخطأ
    _, status_out = run_cmd("git status --porcelain", capture=True)
    if status_out:
        commands.append("git add .")
        commands.append('git commit -m "Update project"')
        
    commands.append("git push origin main")
    title = "📤 Uploading to GitHub..."

# ==============================
# 2. Download
# ==============================
elif choice == "2":
    commands = [
        "git pull origin main",
        "php artisan migrate",
        "php artisan optimize:clear",
        "php artisan view:clear",
        "php artisan cache:clear",
    ]
    title = "📥 Downloading from GitHub..."

# ==============================
# 3. Reset Git
# ==============================
elif choice == "3":
    check_git_config()
    print()
    print(Fore.RED + "⚠️ WARNING!")
    print(
        Fore.RED
        + "This will DELETE the .git folder"
        + " and FORCE PUSH to GitHub."
    )
    print()

    confirm = input(
        Fore.YELLOW
        + "Continue? (y/n): "
        + Style.RESET_ALL
    ).strip().lower()

    if confirm != "y":
        print(Fore.YELLOW + "❌ Cancelled.")
        exit()

    commands = [
        "rm -rf .git",
        "git init",
        "git add .",
        'git commit -m "Initial upload"',
        "git branch -M main",
        "git remote add origin https://github.com/engmohammadwak/fronEndOman.git",
        "git push -u origin main --force",
    ]
    title = "💣 Resetting Git & Force Uploading..."

else:
    print(Fore.RED + "❌ Invalid choice.")
    exit()

# ==============================
# تنفيذ الأوامر
# ==============================

print()
print(Fore.CYAN + "=" * 55)
print(Fore.YELLOW + title)
print(Fore.CYAN + "=" * 55)
print()

for cmd in commands:
    print(Fore.YELLOW + f"▶ {cmd}")

    res_code = run_cmd(cmd)

    if res_code == 0:
        print(Fore.GREEN + "✅ Success\n")
    else:
        print(Fore.RED + f"❌ Failed: {cmd}\n")
        break
else:
    print(Fore.CYAN + "=" * 55)
    print(Fore.GREEN + "🎉 All operations completed successfully!")
    print(Fore.CYAN + "=" * 55)