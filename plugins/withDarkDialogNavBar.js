// plugins/withDarkDialogNavBar.js
const { withAndroidStyles, withAndroidManifest } = require("@expo/config-plugins");

/**
 * 1. Dark nav bar for all Android Dialog windows (including React Native Modal).
 * 2. Sets adjustNothing on MainActivity so Android never auto-shifts the window
 *    when the keyboard opens — KeyboardAvoidingView handles it per-screen instead.
 */
function withDarkStyles(config) {
  return withAndroidStyles(config, (config) => {
    const styles = config.modResults;

    if (!styles.resources) styles.resources = {};
    if (!styles.resources.style) styles.resources.style = [];

    // 1. Add a DarkDialogTheme style
    // windowSoftInputMode on the dialog theme makes all RN Modals (which are Dialogs)
    // pan their window up when the keyboard opens — same as the main Activity.
    const darkDialogTheme = {
      $: { name: "DarkDialogTheme", parent: "Theme.AppCompat.Dialog" },
      item: [
        { $: { name: "android:windowSoftInputMode" }, _: "adjustPan" },
        { $: { name: "android:colorBackground" }, _: "#0d0d0d" },
        { $: { name: "android:navigationBarColor" }, _: "#0d0d0d" },
      ],
    };

    const existingIdx = styles.resources.style.findIndex(
      (s) => s.$ && s.$.name === "DarkDialogTheme"
    );
    if (existingIdx >= 0) {
      styles.resources.style[existingIdx] = darkDialogTheme;
    } else {
      styles.resources.style.push(darkDialogTheme);
    }

    // 2. Add android:dialogTheme and dark window background to AppTheme
    const appTheme = styles.resources.style.find(
      (s) => s.$ && s.$.name === "AppTheme"
    );
    if (appTheme) {
      if (!appTheme.item) appTheme.item = [];
      const THEME_ITEMS = ["android:dialogTheme", "android:windowBackground", "android:colorBackground"];
      appTheme.item = appTheme.item.filter(
        (item) => item.$ && !THEME_ITEMS.includes(item.$.name)
      );
      appTheme.item.push(
        { $: { name: "android:dialogTheme" }, _: "@style/DarkDialogTheme" },
        { $: { name: "android:windowBackground" }, _: "#0d0d0d" },
        { $: { name: "android:colorBackground" }, _: "#0d0d0d" }
      );
    }

    return config;
  });
}

function withAdjustNothing(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults;
    const application = manifest.manifest.application?.[0];
    if (application?.activity) {
      const mainActivity = application.activity.find(
        (a) => a.$?.["android:name"] === ".MainActivity"
      );
      if (mainActivity) {
        // adjustPan: Android pans the window up natively when the keyboard opens,
        // keeping the focused input visible without needing KeyboardAvoidingView logic.
        mainActivity.$["android:windowSoftInputMode"] = "adjustPan";
      }
    }
    return config;
  });
}

module.exports = function withDarkDialogNavBar(config) {
  return withAdjustNothing(withDarkStyles(config));
};
