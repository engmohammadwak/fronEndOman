import subprocess
from colorama import Fore, Style, init

# تشغيل الألوان
init(autoreset=True)


# ==============================
# الأوامر
# ==============================

# تحميل / تحديث المشروع
download_commands = [
    "git pull origin main",
    "php artisan migrate",
    "php artisan optimize:clear",
    "php artisan view:clear",
    "php artisan cache:clear",
]

# رفع التعديلات إلى GitHub
upload_commands = [
    "git status",
    "git add .",
    'git commit -m "Update project"',
    "git push origin main",
]

# حذف Git وإعادة ربط المشروع
reset_upload_commands = [
    "rm -rf .git",
    "git init",
    "git add .",
    'git commit -m "Initial upload"',
    "git branch -M main",
    "git remote add origin https://github.com/engmohammadwak/fronEndOman.git",
    "git push -u origin main --force",
]


# ==============================
# Header
# ==============================

print(Fore.CYAN + "=" * 55)
print(Fore.YELLOW + "🚀 Git Manager - macOS")
print(Fore.CYAN + "=" * 55)

print(Fore.GREEN + "1️⃣  Upload to GitHub")
print(Fore.BLUE + "2️⃣  Download from GitHub")
print(Fore.RED + "3️⃣  Reset Git & Force Upload")
print(Fore.MAGENTA + "4️⃣  Start Laravel Server")
print(Fore.CYAN + "5️⃣  Git Status")
print(Fore.WHITE + "6️⃣  Exit")

print(Fore.CYAN + "=" * 55)


# ==============================
# اختيار المستخدم
# ==============================

choice = input(
    Fore.MAGENTA + "👉 Choose (1/2/3/4/5/6): "
    + Style.RESET_ALL
).strip()


# ==============================
# Upload
# ==============================

if choice == "1":

    commands = upload_commands
    title = "📤 Uploading to GitHub..."


# ==============================
# Download
# ==============================

elif choice == "2":

    commands = download_commands
    title = "📥 Downloading from GitHub..."


# ==============================
# Reset Git
# ==============================

elif choice == "3":

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

    commands = reset_upload_commands
    title = "💣 Resetting Git & Force Uploading..."


# ==============================
# Laravel Server
# ==============================

elif choice == "4":

    print()
    print(Fore.GREEN + "🚀 Starting Laravel Server...")
    print(Fore.CYAN + "🌐 http://127.0.0.1:8000")
    print(Fore.YELLOW + "⛔ Press Ctrl + C to stop the server.")
    print()

    subprocess.run(
        "php artisan serve",
        shell=True
    )

    exit()


# ==============================
# Git Status
# ==============================

elif choice == "5":

    print()
    print(Fore.CYAN + "📊 Git Status")
    print(Fore.CYAN + "=" * 55)
    print()

    subprocess.run(
        "git status",
        shell=True
    )

    print()
    exit()


# ==============================
# Exit
# ==============================

elif choice == "6":

    print(Fore.YELLOW + "👋 Goodbye!")
    exit()


# ==============================
# Invalid
# ==============================

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

    result = subprocess.run(
        cmd,
        shell=True
    )

    if result.returncode == 0:

        print(
            Fore.GREEN
            + "✅ Success"
        )
        print()

    else:

        print(
            Fore.RED
            + f"❌ Failed: {cmd}"
        )
        print()

        break


else:

    print(Fore.CYAN + "=" * 55)
    print(
        Fore.GREEN
        + "🎉 All operations completed successfully!"
    )
    print(Fore.CYAN + "=" * 55)