import * as React from 'react';
import {View, Text, StyleSheet, Pressable} from 'react-native';
import Svg, {Path, G} from 'react-native-svg';

export type ArcOption<T extends string> = {
  id: T;
  label: string;
  shortLabel?: string;
};

export type ArcFillMode = 'cumulative' | 'continuous';

/** How continuous value maps to arc length (10 of 100 → 10% of semicircle). */
export type ContinuousScale = 'range' | 'percentOfMax';

type Props<T extends string> = {
  options: ArcOption<T>[];
  value: T;
  onChange: (id: T) => void;
  accent: string;
  colorForOption?: (id: T) => string;
  titleColor?: string;
  size?: number;
  title?: string;
  trackColor?: string;
  fillMode?: ArcFillMode;
  continuousValue?: number;
  continuousMin?: number;
  continuousMax?: number;
  continuousScale?: ContinuousScale;
  /** Ten-step ink bands (measurability), no tick marks on track. */
  colorForDecileIndex?: (index: number) => string;
  captionText?: string;
  showCaptionEdit?: boolean;
  onCaptionEditPress?: () => void;
};

const START_DEG = 180;
const SWEEP_DEG = 180;
const DIAL_H_RATIO = 0.54;
export const ARC_TITLE_H = 20;
export const ARC_CAPTION_H = 0;

/** Shared readout slot so «Мес», «100», «10» sit on one baseline. */
const READOUT_SLOT_H = 24;
const READOUT_FONT = 16;
const PENCIL_SLOT_W = 18;

export default function ArcSectorPicker<T extends string>({
  options,
  value,
  onChange,
  accent,
  colorForOption,
  titleColor = '#64748b',
  size = 140,
  title,
  trackColor = '#ddd6c8',
  fillMode = 'cumulative',
  continuousValue,
  continuousMin = 0,
  continuousMax = 100,
  continuousScale = 'range',
  colorForDecileIndex,
  captionText,
  showCaptionEdit,
  onCaptionEditPress,
}: Props<T>) {
  const height = Math.round(size * DIAL_H_RATIO);
  const blockH = ARC_TITLE_H + height + 4;
  const strokeW = Math.max(9, Math.round(size * 0.095));
  const cx = size / 2;
  const r = Math.min(size * 0.44, size / 2 - strokeW - 2);
  const cy = height - strokeW * 0.5;
  const n = Math.max(options.length, 1);
  const stepDeg = SWEEP_DEG / n;
  /** Bottom of readout slot sits on the semicircle diameter (y = cy). */
  const readoutTop = cy - READOUT_SLOT_H + 2;

  const selectedIndex = Math.max(0, options.findIndex(o => o.id === value));

  const fillColor = (id: T) => (colorForOption ? colorForOption(id) : accent);

  const clampedContinuous = React.useMemo(() => {
    if (continuousMax <= continuousMin) {
      return continuousMin;
    }
    const v = continuousValue ?? continuousMin;
    return Math.min(continuousMax, Math.max(continuousMin, v));
  }, [continuousValue, continuousMin, continuousMax]);

  const fillLengthDeg = React.useMemo(() => {
    if (fillMode === 'continuous') {
      let ratio = 0;
      if (continuousMax > 0) {
        if (continuousScale === 'percentOfMax') {
          ratio = clampedContinuous / continuousMax;
        } else {
          ratio =
            (clampedContinuous - continuousMin) /
            (continuousMax - continuousMin);
        }
      }
      return Math.min(1, Math.max(0, ratio)) * SWEEP_DEG;
    }
    return (selectedIndex + 1) * stepDeg;
  }, [
    fillMode,
    clampedContinuous,
    continuousMin,
    continuousMax,
    continuousScale,
    selectedIndex,
    stepDeg,
  ]);

  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const normEndDeg = (d: number) => (d >= 360 ? 360 : d);

  const arcStroke = (deg0: number, deg1: number) => {
    const end = normEndDeg(deg1);
    if (end <= deg0 + 0.2) {
      return '';
    }
    const x0 = cx + r * Math.cos(toRad(deg0));
    const y0 = cy + r * Math.sin(toRad(deg0));
    const x1 = cx + r * Math.cos(toRad(end === 360 ? 360 : end));
    const y1 = cy + r * Math.sin(toRad(end === 360 ? 360 : end));
    const span = end - deg0;
    const large = span > 180 ? 1 : 0;
    return `M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1}`;
  };

  const inkSegments = React.useMemo(() => {
    const fillEnd = START_DEG + fillLengthDeg;
    const segments: {d: string; color: string}[] = [];

    if (fillMode === 'continuous' && colorForDecileIndex && fillLengthDeg > 0.2) {
      const decileStep = SWEEP_DEG / 10;
      for (let i = 0; i < 10; i++) {
        const segStart = START_DEG + i * decileStep;
        const segEnd = START_DEG + (i + 1) * decileStep;
        if (fillEnd <= segStart + 0.05) {
          break;
        }
        const end = Math.min(segEnd, fillEnd);
        segments.push({
          d: arcStroke(segStart, end),
          color: colorForDecileIndex(i),
        });
      }
      return segments;
    }

    for (let i = 0; i < n; i++) {
      const segStart = START_DEG + i * stepDeg;
      const segEnd = START_DEG + (i + 1) * stepDeg;
      if (fillEnd <= segStart + 0.05) {
        break;
      }
      const end = Math.min(segEnd, fillEnd);
      const id = options[i]?.id;
      if (id == null) {
        continue;
      }
      segments.push({
        d: arcStroke(segStart, end),
        color: fillColor(id),
      });
    }
    return segments;
  }, [
    fillLengthDeg,
    fillMode,
    colorForDecileIndex,
    fillLengthDeg,
    n,
    stepDeg,
    options,
    colorForOption,
    accent,
  ]);

  const hitTest = (x: number, y: number): T | null => {
    if (y > cy + strokeW) {
      return null;
    }
    const dx = x - cx;
    const dy = y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < r - strokeW || dist > r + strokeW + 6) {
      return null;
    }
    let deg = (Math.atan2(dy, dx) * 180) / Math.PI;
    if (deg < 0) {
      deg += 360;
    }
    let rel = deg - START_DEG;
    if (rel < 0) {
      rel += 360;
    }
    if (rel > SWEEP_DEG) {
      return null;
    }
    const idx = Math.min(n - 1, Math.floor(rel / stepDeg));
    return options[idx]?.id ?? null;
  };

  const defaultCaption =
    options.find(o => o.id === value)?.shortLabel ??
    options.find(o => o.id === value)?.label ??
    options[selectedIndex]?.shortLabel ??
    ' ';

  const caption = captionText ?? defaultCaption;

  const readoutRow = (
    <View style={styles.readoutRow}>
      <Text style={styles.readoutText} numberOfLines={1}>
        {caption}
      </Text>
      {showCaptionEdit ? (
        <Pressable
          onPress={onCaptionEditPress}
          hitSlop={8}
          accessibilityLabel="Изменить значение"
          style={styles.pencilBtn}>
          <Text style={styles.pencil}>✎</Text>
        </Pressable>
      ) : null}
    </View>
  );

  return (
    <View style={[styles.wrap, {width: size, minHeight: blockH}]}>
      <Text
        style={[styles.title, {color: titleColor, height: ARC_TITLE_H}]}
        numberOfLines={1}>
        {title ?? ' '}
      </Text>
      <View style={{width: size, height}}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={e => {
            const id = hitTest(e.nativeEvent.locationX, e.nativeEvent.locationY);
            if (id) {
              onChange(id);
            }
          }}>
          <Svg width={size} height={height}>
            <G>
              <Path
                d={arcStroke(START_DEG, 360)}
                stroke={trackColor}
                strokeWidth={strokeW}
                fill="none"
                strokeLinecap="round"
              />
              {inkSegments.map((seg, idx) => (
                <Path
                  key={`ink-${idx}`}
                  d={seg.d}
                  stroke={seg.color}
                  strokeWidth={strokeW}
                  fill="none"
                  strokeLinecap="round"
                />
              ))}
            </G>
          </Svg>
        </Pressable>
        <View
          pointerEvents="box-none"
          style={[
            styles.readoutWrap,
            {top: readoutTop, width: size, height: READOUT_SLOT_H},
          ]}>
          {readoutRow}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {alignItems: 'center'},
  title: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
    textAlign: 'center',
    lineHeight: 20,
    color: '#64748b',
  },
  readoutWrap: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  readoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  readoutText: {
    fontSize: READOUT_FONT,
    fontWeight: '800',
    color: '#334155',
    textAlign: 'center',
    lineHeight: READOUT_SLOT_H,
    includeFontPadding: false,
  },
  pencilBtn: {
    width: PENCIL_SLOT_W,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pencil: {
    fontSize: 15,
    color: '#64748b',
    fontWeight: '600',
  },
});
