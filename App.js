import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CATEGORIES = ["Food", "Travel", "Shopping", "Education", "Bills", "Other"];

export default function App() {
  const [expenses, setExpenses] = useState([]);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadExpenses();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem("expenses", JSON.stringify(expenses));
  }, [expenses]);

  const loadExpenses = async () => {
    try {
      const saved = await AsyncStorage.getItem("expenses");
      if (saved) setExpenses(JSON.parse(saved));
    } catch {
      Alert.alert("Error", "Could not load saved expenses.");
    }
  };

  const total = useMemo(
    () => expenses.reduce((sum, item) => sum + Number(item.amount), 0),
    [expenses]
  );

  const addExpense = () => {
    const value = Number(amount);
    if (!name.trim() || !amount.trim() || !Number.isFinite(value) || value <= 0) {
      Alert.alert("Invalid input", "Enter an expense name and a valid amount.");
      return;
    }

    const newExpense = {
      id: Date.now().toString(),
      name: name.trim(),
      amount: value,
      category,
      date: new Date().toLocaleDateString("en-IN"),
    };

    setExpenses((current) => [newExpense, ...current]);
    setName("");
    setAmount("");
    setCategory("Food");
    setShowForm(false);
  };

  const deleteExpense = (id) => {
    Alert.alert("Delete expense?", "This expense will be removed.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => setExpenses((current) => current.filter((e) => e.id !== id)),
      },
    ]);
  };

  const categoryIcon = {
    Food: "🍔",
    Travel: "🚗",
    Shopping: "🛍️",
    Education: "📚",
    Bills: "💡",
    Other: "📦",
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Expense Tracker</Text>
            <Text style={styles.subtitle}>Track your daily spending</Text>
          </View>
          <Text style={styles.wallet}>💰</Text>
        </View>

        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total Spent</Text>
          <Text style={styles.total}>₹{total.toFixed(2)}</Text>
          <Text style={styles.count}>{expenses.length} expense(s)</Text>
        </View>

        {showForm ? (
          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>Add Expense</Text>

            <TextInput
              style={styles.input}
              placeholder="Expense name"
              value={name}
              onChangeText={setName}
            />

            <TextInput
              style={styles.input}
              placeholder="Amount (₹)"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
            />

            <Text style={styles.label}>Category</Text>
            <View style={styles.categories}>
              {CATEGORIES.map((item) => (
                <Pressable
                  key={item}
                  onPress={() => setCategory(item)}
                  style={[
                    styles.category,
                    category === item && styles.categorySelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      category === item && styles.categoryTextSelected,
                    ]}
                  >
                    {categoryIcon[item]} {item}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.formButtons}>
              <Pressable style={styles.cancelButton} onPress={() => setShowForm(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.addButton} onPress={addExpense}>
                <Text style={styles.addText}>Add Expense</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <Pressable style={styles.mainAddButton} onPress={() => setShowForm(true)}>
            <Text style={styles.mainAddText}>＋ Add Expense</Text>
          </Pressable>
        )}

        <Text style={styles.sectionTitle}>Recent Expenses</Text>

        <FlatList
          data={expenses}
          keyExtractor={(item) => item.id}
          contentContainerStyle={expenses.length === 0 ? styles.emptyList : styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🧾</Text>
              <Text style={styles.emptyTitle}>No expenses yet</Text>
              <Text style={styles.emptyText}>Tap “Add Expense” to record your first expense.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.expenseRow}>
              <View style={styles.iconBox}>
                <Text style={styles.icon}>{categoryIcon[item.category] || "📦"}</Text>
              </View>
              <View style={styles.expenseInfo}>
                <Text style={styles.expenseName}>{item.name}</Text>
                <Text style={styles.expenseMeta}>
                  {item.category} • {item.date}
                </Text>
              </View>
              <View style={styles.right}>
                <Text style={styles.expenseAmount}>₹{Number(item.amount).toFixed(2)}</Text>
                <Pressable onPress={() => deleteExpense(item.id)}>
                  <Text style={styles.delete}>Delete</Text>
                </Pressable>
              </View>
            </View>
          )}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F5F7FB" },
  container: { flex: 1, paddingHorizontal: 18 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 18,
    paddingBottom: 14,
  },
  title: { fontSize: 27, fontWeight: "800", color: "#172033" },
  subtitle: { marginTop: 3, color: "#727B8C", fontSize: 14 },
  wallet: { fontSize: 34 },
  totalCard: {
    backgroundColor: "#2F6FED",
    borderRadius: 20,
    padding: 22,
    marginBottom: 14,
  },
  totalLabel: { color: "#DDE8FF", fontSize: 14 },
  total: { color: "#fff", fontSize: 34, fontWeight: "800", marginTop: 5 },
  count: { color: "#DDE8FF", marginTop: 4 },
  mainAddButton: {
    backgroundColor: "#172033",
    paddingVertical: 15,
    borderRadius: 13,
    alignItems: "center",
    marginBottom: 20,
  },
  mainAddText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  formCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#172033",
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#DCE1EA",
    borderRadius: 11,
    paddingHorizontal: 13,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 10,
    backgroundColor: "#FAFBFD",
  },
  label: { fontWeight: "700", color: "#424B5C", marginBottom: 8 },
  categories: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  category: {
    borderWidth: 1,
    borderColor: "#DCE1EA",
    borderRadius: 20,
    paddingHorizontal: 11,
    paddingVertical: 8,
  },
  categorySelected: { backgroundColor: "#E8F0FF", borderColor: "#2F6FED" },
  categoryText: { color: "#596274", fontSize: 13 },
  categoryTextSelected: { color: "#2F6FED", fontWeight: "700" },
  formButtons: { flexDirection: "row", gap: 10, marginTop: 14 },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#DCE1EA",
    paddingVertical: 12,
    borderRadius: 11,
    alignItems: "center",
  },
  cancelText: { color: "#596274", fontWeight: "700" },
  addButton: {
    flex: 1,
    backgroundColor: "#2F6FED",
    paddingVertical: 12,
    borderRadius: 11,
    alignItems: "center",
  },
  addText: { color: "#fff", fontWeight: "700" },
  list: { paddingBottom: 30 },
  emptyList: { flexGrow: 1 },
  empty: { alignItems: "center", justifyContent: "center", padding: 35 },
  emptyIcon: { fontSize: 42 },
  emptyTitle: { fontSize: 18, fontWeight: "800", color: "#343C4D", marginTop: 8 },
  emptyText: { textAlign: "center", color: "#7A8392", marginTop: 5, lineHeight: 20 },
  expenseRow: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 13,
    marginBottom: 9,
    flexDirection: "row",
    alignItems: "center",
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#F0F3F9",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: { fontSize: 21 },
  expenseInfo: { flex: 1, marginLeft: 11 },
  expenseName: { fontWeight: "800", color: "#2A3242", fontSize: 15 },
  expenseMeta: { color: "#818A99", fontSize: 12, marginTop: 4 },
  right: { alignItems: "flex-end" },
  expenseAmount: { fontWeight: "800", color: "#172033", fontSize: 15 },
  delete: { color: "#E24B4B", fontSize: 12, marginTop: 5 },
});
