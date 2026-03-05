// plugins/withDarkDialogNavBar.js
const { withAndroidStyles } = require("@expo/config-plugins");

/**
 * Adds a dark navigation bar to all Android Dialog windows (including React Native Modal).
 * React Native's Modal creates a Dialog with its own window, which doesn't inherit
 * the Activity's edge-to-edge nav bar settings. This plugin injects a dialog theme
 * into styles.xml so all Dialogs use a dark nav bar.
 */
module.exports = function withDarkDialogNavBar(config) {
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

    // 2. Add android:dialogTheme to AppTheme
    const appTheme = styles.resources.style.find(
      (s) => s.$ && s.$.name === "AppTheme"
    );
    if (appTheme) {
      if (!appTheme.item) appTheme.item = [];
      appTheme.item = appTheme.item.filter(
        (item) => item.$ && item.$.name !== "android:dialogTheme"
      );
      appTheme.item.push({
        $: { name: "android:dialogTheme" },
        _: "@style/DarkDialogTheme",
      });
    }

    return config;
  });
};
