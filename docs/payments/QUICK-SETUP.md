# ⚡ Quick Setup - Make Payments Work in 2 Minutes

## 🎯 **What You Need RIGHT NOW**

### **1. Create Environment File** (30 seconds)

Create `.env.local` in your project root:

```bash
# Windows
echo NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51234567890abcdefghijklmnopqrstuvwxyz > .env.local
echo NODE_ENV=development >> .env.local

# Mac/Linux
cat > .env.local << EOF
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51234567890abcdefghijklmnopqrstuvwxyz
NODE_ENV=development
EOF
```

### **2. Get Real Stripe Key** (1 minute)

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. Copy your **Test** publishable key
3. Replace the fake key in `.env.local`

### **3. Start Development** (30 seconds)

```bash
npm run dev
```

### **4. Test Payment Form**

1. Go to `http://localhost:3000/payments/checkout`
2. Select a plan
3. Use test card: `4242 4242 4242 4242`
4. Fill other details and click "Pay Now"

## ✅ **What Works Immediately**

- ✅ **Payment Form** - Complete with validation
- ✅ **Card Input** - Both Stripe Elements and manual
- ✅ **Plan Selection** - All pricing tiers
- ✅ **Form Validation** - Real-time error checking
- ✅ **Responsive Design** - Mobile and desktop
- ✅ **Dark Mode** - Full theme support
- ✅ **Error Handling** - User-friendly messages

## 🧪 **Test Cards**

```
✅ Success: 4242 4242 4242 4242
❌ Declined: 4000 0000 0000 0002
🔐 3D Secure: 4000 0025 0000 3155
```

## 🚨 **Current Limitations**

- **No Real Payments** - All processing is mocked
- **No Backend** - API calls are disabled in dev mode
- **Mock Authentication** - Uses localStorage token

## 🎉 **Ready to Test!**

Your payment system is now ready for development and testing! 🚀
