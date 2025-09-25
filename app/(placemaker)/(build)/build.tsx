import { View, Text, StyleSheet } from "react-native";

export default function BuildScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome to Build</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    backgroundColor: "#1a1a1a" 
  },
  text: { 
    fontSize: 24, 
    fontWeight: "bold",
    color: "#fff", 
  },
});
