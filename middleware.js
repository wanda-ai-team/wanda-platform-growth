export { default } from "next-auth/middleware"
export const config = {
    matcher: [
        "/document/generateDocument",
        "/document/generateDocumentNew",
        "/document/checkGeneratedDocument",
        "/document/generateDocumentNew/:repos*",
        "/document/generateDocumentNew/x",
        "/documentGeneration",
        "/payment",
        "/documentGeneration/:repos*",
        "/onboarding",
        "/",
        "/dashboard",
        "/reporpuse",
        "/repurpose",
        "/insights",
        "/slack"
    ]
}
