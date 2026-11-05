import { StyleSheet, View } from 'react-native';

import { WalkPoint } from '@/data/content';
import { colors } from '@/constants/theme';

export function WalkSketch({ points, live }: { points: WalkPoint[]; live: boolean }) {
  if (points.length === 0) return null;
  const latitudes = points.map((point) => point.latitude);
  const longitudes = points.map((point) => point.longitude);
  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLng = Math.min(...longitudes);
  const maxLng = Math.max(...longitudes);
  const latSpan = Math.max(maxLat - minLat, 0.0002);
  const lngSpan = Math.max(maxLng - minLng, 0.0002);

  return (
    <View style={styles.board}>
      {points.map((point, index) => {
        const last = index === points.length - 1;
        return (
          <View
            key={`${point.at}-${index}`}
            style={[
              styles.dot,
              last && styles.here,
              live && last && styles.live,
              {
                left: `${((point.longitude - minLng) / lngSpan) * 84 + 8}%`,
                top: `${(1 - (point.latitude - minLat) / latSpan) * 76 + 12}%`,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  board: { height: 148, borderRadius: 16, backgroundColor: colors.surfaceLow, overflow: 'hidden' },
  dot: {
    position: 'absolute',
    width: 8,
    height: 8,
    marginLeft: -4,
    marginTop: -4,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  here: { width: 14, height: 14, marginLeft: -7, marginTop: -7, borderRadius: 7, backgroundColor: colors.ink },
  live: { backgroundColor: colors.primary },
});
