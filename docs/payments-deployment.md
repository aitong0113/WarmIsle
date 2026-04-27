# Payment Deployment Guide

## `.env` / Secrets 準備

前端 `.env.local`：

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SITE_URL=http://localhost:5173
```

Supabase Edge Function secrets：

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
PUBLIC_SITE_URL=https://your-domain.com

STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_PRICE_ID_MONTHLY=price_xxx_monthly
STRIPE_PRICE_ID_YEARLY=price_xxx_yearly
STRIPE_WEBHOOK_SECRET=whsec_xxx

LINEPAY_API_BASE=https://sandbox-api-pay.line.me
LINEPAY_CHANNEL_ID=your-linepay-channel-id
LINEPAY_CHANNEL_SECRET=your-linepay-channel-secret
```

## Supabase CLI 部署指令

```bash
supabase login
supabase link --project-ref your-project-ref

supabase secrets set \
  SUPABASE_URL=https://your-project.supabase.co \
  SUPABASE_ANON_KEY=your-anon-key \
  SUPABASE_SERVICE_ROLE_KEY=your-service-role-key \
  PUBLIC_SITE_URL=https://your-domain.com \
  STRIPE_SECRET_KEY=sk_live_xxx \
  STRIPE_PRICE_ID_MONTHLY=price_xxx_monthly \
  STRIPE_PRICE_ID_YEARLY=price_xxx_yearly \
  STRIPE_WEBHOOK_SECRET=whsec_xxx \
  LINEPAY_API_BASE=https://sandbox-api-pay.line.me \
  LINEPAY_CHANNEL_ID=your-linepay-channel-id \
  LINEPAY_CHANNEL_SECRET=your-linepay-channel-secret

supabase functions deploy create-stripe-checkout
supabase functions deploy stripe-webhook --no-verify-jwt
supabase functions deploy create-linepay-checkout
```

本機測試：

```bash
supabase start
supabase functions serve create-stripe-checkout --env-file .env.local
supabase functions serve stripe-webhook --env-file .env.local
supabase functions serve create-linepay-checkout --env-file .env.local
```

## Stripe Dashboard 設定

1. 建立兩個 Price：月付與年付。
2. 把 Price ID 分別填進 `STRIPE_PRICE_ID_MONTHLY`、`STRIPE_PRICE_ID_YEARLY`。
3. 到 Developers > Webhooks 新增 endpoint：

```text
https://your-project-ref.functions.supabase.co/stripe-webhook
```

4. 勾選事件：`checkout.session.completed`。
5. 取得 webhook signing secret，填入 `STRIPE_WEBHOOK_SECRET`。
6. `PUBLIC_SITE_URL` 請設成正式網域，Stripe success/cancel callback 會自動帶回：

```text
/upgrade?checkout=success&provider=stripe&plan=monthly&lockedFeature=營火廣場&returnTo=/campfire
```

## LINE Pay Console 設定

1. 建立 LINE Pay Channel，取得 Channel ID 與 Channel Secret。
2. sandbox 先用：`LINEPAY_API_BASE=https://sandbox-api-pay.line.me`。
3. 正式上線再換正式 API base。
4. 這一版已完成 server-side 建單與導轉，但還沒補 transaction confirm / reconciliation；若要正式上線，建議下一步補：
   - payment confirm API
   - transaction status sync
   - renew / subscription policy

## 回跳與頁面行為

付款成功後前端會回到 `/upgrade?checkout=success...`，然後直接導去原本被鎖住的功能頁，同時顯示小型成功 toast。

付款取消則會回到 `/upgrade?checkout=canceled...`。
