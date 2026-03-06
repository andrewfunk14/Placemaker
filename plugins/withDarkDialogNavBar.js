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
    const darkDialogTheme = {
      $: { name: "DarkDialogTheme", parent: "Theme.AppCompat.Dialog" },
      item: [
        { $: { name: "android:navigationBarColor" }, _: "#0d0d0d" },
        { $: { name: "android:windowLightNavigationBar" }, _: "false" },
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
      const THEME_ITEMS = ["android:dialogTheme", "android:windowBackground", "android:windowLightNavigationBar"];
      appTheme.item = appTheme.item.filter(
        (item) => item.$ && !THEME_ITEMS.includes(item.$.name)
      );
      appTheme.item.push(
        { $: { name: "android:dialogTheme" }, _: "@style/DarkDialogTheme" },
        { $: { name: "android:windowBackground" }, _: "#0d0d0d" },
        { $: { name: "android:windowLightNavigationBar" }, _: "false" }
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
        // adjustNothing: Android won't auto-shift the window for the keyboard.
        // KeyboardAvoidingView handles avoidance manually per-modal/screen.
        mainActivity.$["android:windowSoftInputMode"] = "adjustNothing";
      }
    }
    return config;
  });
}

module.exports = function withDarkDialogNavBar(config) {
  return withAdjustNothing(withDarkStyles(config));
};
