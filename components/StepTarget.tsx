import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText, Button, Field } from '@/components/ui';
import { goalOptions } from '@/data/content';
import { clampSteps, formatFull } from '@/lib/format';

export function StepTarget({
  value,
  onChange,
  presets,
  min = 1000,
  max = 100000,
  step = 500,
  showPresets = true,
}: {
  value: number;
  onChange: (steps: number) => void;
  presets?: number[];
  min?: number;
  max?: number;
  step?: number;
  showPresets?: boolean;
}) {
  const options = presets ?? goalOptions.map((option) => option.steps);
  const [text, setText] = useState(String(value));

  useEffect(() => {
    setText(String(value));
  }, [value]);

  function commit(next: number) {
    onChange(clampSteps(next, min, max));
  }

  return (
    <View style={styles.wrap}>
      {showPresets ? (
        <View style={styles.presets}>
          {options.map((steps) => (
            <Button
              key={steps}
              label={formatFull(steps)}
              size="sm"
              fullWidth={false}
              variant={value === steps ? 'primary' : 'ghost'}
              onPress={() => commit(steps)}
            />
          ))}
        </View>
      ) : null}
      <Field
        label="Custom target"
        value={text}
        keyboardType="number-pad"
        icon="flag"
        onChangeText={(raw) => {
          const digits = raw.replace(/[^0-9]/g, '').slice(0, 8);
          setText(digits);
          const next = Number(digits);
          if (next >= min && next <= max) onChange(next);
        }}
      />
      <View style={styles.stepper}>
        <Button label={`− ${formatFull(step)}`} size="sm" variant="secondary" onPress={() => commit(value - step)} style={styles.step} />
        <Button label={`+ ${formatFull(step)}`} size="sm" variant="secondary" onPress={() => commit(value + step)} style={styles.step} />
      </View>
      <AppText variant="labelSm">
        Any target from {formatFull(min)} to {formatFull(max)} steps.
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  presets: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  stepper: { flexDirection: 'row', alignItems: 'stretch', gap: 8 },
  step: { flex: 1 },
});
