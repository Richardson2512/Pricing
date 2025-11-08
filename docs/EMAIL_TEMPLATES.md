# 📧 Email Templates Guide

Beautiful, branded email templates for Supabase authentication.

---

## 🎨 Design Features

All email templates include:
- ✅ **Logo**: HowMuchShouldIPrice logo at top
- ✅ **Brand Colors**: Olive green (#6B7A3E) and beige (#F5F1E8)
- ✅ **Sharp Box Design**: Clean, modern rounded containers
- ✅ **Gradient Header**: Olive green gradient background
- ✅ **Responsive**: Works on all devices
- ✅ **Professional**: Clean typography and spacing
- ✅ **Accessible**: High contrast, readable fonts

---

## 📁 Available Templates

### **1. Confirm Signup** (`confirm-signup.html`)
- Welcome message
- Email confirmation button
- 3 free credits mention
- What's next section
- Security note

### **2. Reset Password** (`reset-password.html`)
- Password reset button
- Security warning
- Expiry notice (1 hour)
- Alternative link option

---

## 🔧 How to Add to Supabase

### **Step 1: Go to Email Templates**
1. Supabase Dashboard → **Authentication** → **Email Templates**

### **Step 2: Select Template Type**
Choose the template you want to update:
- **Confirm signup**
- **Reset password**
- **Magic link**
- **Change email address**

### **Step 3: Copy HTML**
1. Open the template file (e.g., `email-templates/confirm-signup.html`)
2. Copy the entire HTML content
3. Paste into Supabase email template editor

### **Step 4: Verify Variables**
Make sure these Supabase variables are present:
- `{{ .ConfirmationURL }}` - The action link
- `{{ .Token }}` - Auth token (if needed)
- `{{ .SiteURL }}` - Your site URL

### **Step 5: Send Test Email**
1. Click **"Send test email"** in Supabase
2. Check your inbox
3. Verify design looks correct
4. Test the confirmation link

### **Step 6: Save**
Click **"Save"** to apply the template

---

## 📋 **Supabase Email Template Settings:**

### **Confirm Signup Template:**

**Subject:**
```
Confirm Your Email - HowMuchShouldIPrice
```

**Body:**
```html
[Paste contents from email-templates/confirm-signup.html]
```

---

### **Reset Password Template:**

**Subject:**
```
Reset Your Password - HowMuchShouldIPrice
```

**Body:**
```html
[Paste contents from email-templates/reset-password.html]
```

---

## 🎨 **Design Elements:**

### **Colors Used:**
```css
Olive Green: #6B7A3E (primary buttons, accents)
Dark Olive: #5A6633 (gradient end)
Beige: #F5F1E8 (background, info boxes)
Beige Border: #E8DFC8 (box borders)
Slate Dark: #1E293B (footer, headings)
Slate Text: #475569 (body text)
Slate Light: #64748B (secondary text)
White: #FFFFFF (main content background)
```

### **Typography:**
- **Headers**: 28px, bold, white (on gradient)
- **Subheaders**: 22px, semibold, slate-900
- **Body**: 16px, regular, slate-600
- **Small text**: 13-14px, slate-500
- **Font**: System fonts (Apple, Segoe UI, Roboto)

### **Spacing:**
- **Container padding**: 40px vertical, 30px horizontal
- **Section spacing**: 20-30px between elements
- **Button padding**: 16px vertical, 40px horizontal
- **Border radius**: 8-16px (modern, rounded)

---

## 📱 **Mobile Responsive:**

All templates are:
- ✅ Mobile-friendly (max-width: 600px)
- ✅ Readable on small screens
- ✅ Touch-friendly buttons (44px+ height)
- ✅ No horizontal scroll
- ✅ Proper text sizing

---

## 🧪 **Testing Checklist:**

Before going live:
- [ ] Logo displays correctly
- [ ] Colors match brand (olive & beige)
- [ ] Confirmation button works
- [ ] Alternative link is clickable
- [ ] Footer links work
- [ ] Mobile view looks good
- [ ] Text is readable
- [ ] No broken images
- [ ] Security notes are clear
- [ ] Expiry time is correct

---

## 🎯 **Email Flow:**

### **User Signs Up:**
1. User enters email and password
2. Supabase sends confirmation email
3. User receives branded email with logo
4. User clicks "Confirm Email Address"
5. Redirected to dashboard
6. Gets 3 free credits

### **User Resets Password:**
1. User clicks "Forgot Password"
2. Enters email
3. Supabase sends reset email
4. User receives branded email
5. User clicks "Reset Password"
6. Creates new password
7. Redirected to sign-in

---

## 🔒 **Security Features:**

- ✅ **Expiry times**: Links expire (24 hours for signup, 1 hour for reset)
- ✅ **Security warnings**: Clear messaging if user didn't request
- ✅ **HTTPS only**: All links use secure protocol
- ✅ **Contact info**: Easy access to support
- ✅ **Terms link**: Legal compliance

---

## 📊 **Email Analytics (Future):**

Track email performance:
- Open rates
- Click-through rates
- Confirmation completion rates
- Time to confirm
- Device types

---

## 🎨 **Customization Options:**

### **Change Colors:**
Replace hex codes:
```css
#6B7A3E → Your primary color
#F5F1E8 → Your background color
#1E293B → Your dark color
```

### **Change Logo:**
Update image src:
```html
<img src="https://howmuchshouldiprice.com/logo.png" ... >
```

### **Change Copy:**
Edit text content while keeping HTML structure

---

## 📝 **Additional Templates Needed:**

### **Magic Link** (Passwordless Login):
- Subject: "Sign in to HowMuchShouldIPrice"
- One-click login button
- Security note

### **Change Email Address**:
- Subject: "Confirm Your New Email"
- Confirmation button
- Security warning

### **Invite User** (Future):
- Subject: "You've been invited to HowMuchShouldIPrice"
- Team invitation
- Accept button

---

## ✅ **Template Files:**

```
email-templates/
├── confirm-signup.html      ✅ Created
├── reset-password.html      ✅ Created
├── magic-link.html          ⏳ Future
└── change-email.html        ⏳ Future
```

---

## 🚀 **How to Apply:**

1. Copy HTML from template files
2. Go to Supabase → Authentication → Email Templates
3. Select template type
4. Paste HTML
5. Update subject line
6. Send test email
7. Save

---

**Your branded email templates are ready to use!** 📧✨

Professional, secure, and perfectly matched to your olive green & beige theme!

