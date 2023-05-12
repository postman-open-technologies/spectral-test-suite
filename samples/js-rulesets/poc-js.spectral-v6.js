import { pattern } from "@stoplight/spectral-functions";
import { oas2, oas3 } from "@stoplight/spectral-formats";
import { DiagnosticSeverity } from "@stoplight/types";

export default {
  rules: {
    "contact-email-postman": {
      description: "Contact email must be <anything>@postman.com",
      formats: [oas2, oas3],
      severity: DiagnosticSeverity.Error,
      given: "$.info.contact.email",
      then: {
        function: pattern,
        functionOptions: {
          match: /@postman.com$/
        }
      }
    }
  }
}