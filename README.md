# health-checkup-issuer

## ブログ記事とのリンク
### フロントエンド
各画面のコードは、src/views配下をご参照ください。

### バックエンド
- A. 発行オファー受付/受診者データ読み取り: amplify/backend/function/patientsFunc/src/app.js
- B. Invitation作成: amplify/backend/function/HCIssuerCreateInvFunc/src/index.js
- C. Invitationメール送信: amplify/backend/function/HCIssuerSendInvMailFunc/src/index.js
- D. ACA-Py Webhook(Connection): amplify/backend/function/HealthCheckupIssuerConnectionListener/src/app.js
- E. ACA-Py Webhook(Issue Credential): amplify/backend/function/HealthCheckupIssuerCredentialListener/src/app.js