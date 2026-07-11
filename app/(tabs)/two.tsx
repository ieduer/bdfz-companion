import { StyleSheet, View } from 'react-native';
import BdfzWebView from '@/components/BdfzWebView';

export default function TabTwoScreen() {
  return (
    <View style={styles.container}>
      <BdfzWebView sourceUrl="https://nav.bdfz.net/" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

