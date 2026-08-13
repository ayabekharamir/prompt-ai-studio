# فونت IRANYekan

به دلیل محدودیت لایسنس، فایل‌های فونت IRANYekan داخل این مخزن قرار داده نشده‌اند.
تا وقتی این فایل‌ها اضافه نشوند، سایت به‌صورت خودکار از فونت Vazirmatn
(متن‌باز و از طریق `next/font` به‌صورت لوکال بارگذاری می‌شود، بدون نیاز به
تنظیم اضافه) به‌عنوان جایگزین استفاده می‌کند — یعنی سایت همین الان هم
حرفه‌ای دیده می‌شود.

## نحوه‌ی فعال‌سازی IRANYekan واقعی

1. نسخه‌ی وب (Webfont Kit با فرمت‌های woff2/woff) فونت IRANYekan را از
   منبع رسمی (مثلاً https://fontiran.com) دانلود کنید — نسخه‌ی
   **IRANYekanWebFaNum** توصیه می‌شود چون اعداد فارسی هم داره.
2. فایل‌های زیر را داخل همین پوشه (`frontend/public/fonts/iranyekan/`) کپی کنید:

   ```
   IRANYekanWebFaNum-Regular.woff2
   IRANYekanWebFaNum-Regular.woff
   IRANYekanWebFaNum-Medium.woff2
   IRANYekanWebFaNum-Medium.woff
   IRANYekanWebFaNum-Bold.woff2
   IRANYekanWebFaNum-Bold.woff
   ```

3. همین! نیازی به تغییر کد نیست — `globals.css` از قبل با همین اسم‌ها
   به فونت ارجاع می‌ده و مرورگر خودکار سراغش می‌ره.

اگر اسم فایل‌های شما فرق داره، مسیرهای `@font-face` را در
`frontend/src/app/globals.css` مطابق اسم فایل‌هایتان ویرایش کنید.
