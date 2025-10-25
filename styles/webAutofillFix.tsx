// styles/WebAutofillFix.tsx
import React from "react";
import { Platform } from "react-native";

export default function WebAutofillFix() {
  if (Platform.OS !== "web") return null;

  const autofillBg = "#2e2e2e";
  const autofillText = "#e5e5e5";
  const autofillFontSize = "16px";

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
        /* Chrome / Edge / Safari (WebKit) */
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus {
        /* Background and text */
        box-shadow: 0 0 0px 1000px ${autofillBg} inset !important;
        -webkit-text-fill-color: ${autofillText} !important;
        caret-color: ${autofillText} !important;

        /* Size + family (optional) */
        font-size: ${autofillFontSize} !important;
        line-height: 2.3 !important;
        /* font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif !important; */

        /* Keep bg from flashing back to default */
        transition: background-color 99999s ease-in-out 0s !important;
        }

        /* Firefox */
        input:-moz-autofill {
        box-shadow: 0 0 0px 1000px ${autofillBg} inset !important;
        -moz-text-fill-color: ${autofillText} !important;
        caret-color: ${autofillText} !important;
        font-size: ${autofillFontSize} !important;
        line-height: 1.3 !important;
        }

        /* Optional: borders/rounding to match your inputs */
        input:-webkit-autofill,
        input:-moz-autofill {
        border: 1px solid gray !important;
        border-radius: 8px !important;
        }
            `,
            }}
            />
        );
        }
