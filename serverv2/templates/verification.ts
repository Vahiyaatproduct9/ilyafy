export default (code: string) => {
  return `
  <div style="font-family: Arial, sans-serif; line-height: 1.6;">
    <h1>Email Verification</h1>
    <p>Your Verification Code is: <strong>${code}</strong></p>
  </div>
`
}