import * as React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  PanResponder,
  LayoutChangeEvent,
} from 'react-native';

type Props = {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Accent for buttons + track (category color) */
  accent?: string;
};

const ROW_H = 44;
const PM = 44;

/** One row: [−] ——— slider + value ——— [+] */
export default function PageCountControl({
  value,
  onChange,
  min = 1,
  max = 100,
  step = 1,
  accent = '#2563eb',
}: Props) {
  const trackW = React.useRef(0);
  const clamp = (n: number) =>
    Math.min(max, Math.max(min, Math.round(n / step) * step));

  const setFromX = (x: number) => {
    if (trackW.current <= 0) {
      return;
    }
    const ratio = Math.min(1, Math.max(0, x / trackW.current));
    onChange(clamp(min + ratio * (max - min)));
  };

  const pan = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: e => setFromX(e.nativeEvent.locationX),
      onPanResponderMove: e => setFromX(e.nativeEvent.locationX),
    }),
  ).current;

  const onLayout = (e: LayoutChangeEvent) => {
    trackW.current = e.nativeEvent.layout.width;
  };

  const fill = max === min ? 0 : ((value - min) / (max - min)) * 100;

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.pm, {borderColor: accent, backgroundColor: '#fff'}]}
          onPress={() => onChange(clamp(value - step))}
          accessibilityLabel="Минус">
          <Text style={[styles.pmText, {color: accent}]}>−</Text>
        </TouchableOpacity>

        <View
          style={[styles.trackOuter, {backgroundColor: `${accent}18`}]}
          onLayout={onLayout}
          {...pan.panHandlers}>
          <View style={styles.track}>
            <View
              style={[styles.fill, {width: `${fill}%`, backgroundColor: accent}]}
            />
          </View>
          <View pointerEvents="none" style={styles.valueLayer}>
            <Text style={[styles.valueOnTrack, {color: accent}]}>{value}</Text>
            <View
              style={[
                styles.thumb,
                {
                  left: `${fill}%`,
                  borderColor: accent,
                },
              ]}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.pm, {borderColor: accent, backgroundColor: '#fff'}]}
          onPress={() => onChange(clamp(value + step))}
          accessibilityLabel="Плюс">
          <Text style={[styles.pmText, {color: accent}]}>＋</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.rangeHint}>
        {min} … {max}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    minHeight: ROW_H + 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    height: ROW_H,
  },
  pm: {
    width: PM,
    height: PM,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  pmText: {fontSize: 22, fontWeight: '700', lineHeight: 24},
  trackOuter: {
    flex: 1,
    marginHorizontal: 10,
    height: ROW_H,
    borderRadius: 10,
    justifyContent: 'center',
    overflow: 'hidden',
    minWidth: 0,
  },
  track: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: (ROW_H - 14) / 2,
    height: 14,
    borderRadius: 7,
  },
  valueLayer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  valueOnTrack: {
    fontSize: 15,
    fontWeight: '800',
    zIndex: 2,
  },
  thumb: {
    position: 'absolute',
    top: (ROW_H - 28) / 2,
    marginLeft: -14,
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 2,
    zIndex: 3,
  },
  rangeHint: {
    fontSize: 11,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 4,
    height: 16,
  },
});
