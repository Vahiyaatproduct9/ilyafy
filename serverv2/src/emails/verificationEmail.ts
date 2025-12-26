import mailto from "@libs/mailer"
import verification from "@templates/verification"

export default async (email: string, code: string) => {
  return await mailto({
    to: email,
    subject: 'Verify your email',
    html: verification(code),
  })
}