import type { ComponentProps } from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export type IconName = ComponentProps<typeof MaterialIcons>['name'];
