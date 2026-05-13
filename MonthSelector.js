// MonthSelector.js
import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useTransactions } from './TransactionContext';
import { useTheme } from './ThemeContext';
import { MONTHS } from './constants';

export default function MonthSelector() {
  const { month: selectedMonth, setMonth: setSelectedMonth } = useTransactions();
  const { colors } = useTheme();
  const scrollViewRef = React.useRef(null);

  React.useEffect(() => {
    if (scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current.scrollTo({ x: selectedMonth * 80 - 80, animated: true });
      }, 500);
    }
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {MONTHS.map((month, index) => {
          const isSelected = index === selectedMonth;
          return (
            <TouchableOpacity
              key={month}
              activeOpacity={0.7}
              onPress={() => setSelectedMonth(index)}
              style={[
                styles.item, 
                isSelected && { backgroundColor: colors.cardAlt }
              ]}
            >
              <Text style={[
                styles.text, 
                { color: colors.textDim },
                isSelected && { color: colors.primaryLight, fontWeight: '700' }
              ]}>
                {month}
              </Text>
              {isSelected && <View style={[styles.dot, { backgroundColor: colors.primaryLight }]} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { height: 50, backgroundColor: 'transparent', marginBottom: 8 },
  scroll: { paddingHorizontal: 12, alignItems: 'center', gap: 8 },
  item: { width: 70, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  text: { fontSize: 14, fontWeight: '600' },
  dot: { position: 'absolute', bottom: 2, width: 4, height: 4, borderRadius: 2 }
});
