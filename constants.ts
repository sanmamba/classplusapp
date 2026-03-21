import { TestData, TestMetadata } from './types';
import testing123 from './tests/testing123.json'
import module_2 from './tests/module_2.json'
import Advp1_15_02_2026 from './tests/Advp1_15_02_2026.json'
import Advp1_22_02_2026 from './tests/Advp1_22_02_2026.json'
import module_4 from './tests/module_4.json'
import Advp2_22_02_2026 from './tests/Advp2_22_02_2026.json'
import module_5 from './tests/module_5.json' 
import Advp1_1_03_2026 from './tests/Advp1_1_03_2026.json' 
import Advp2_1_03_2026 from './tests/Advp2_1_03_2026.json'
import module_6 from './tests/module_6.json'
import module_7 from './tests/module_7.json'
import module_8 from './tests/module_8.json'
import module_9 from './tests/module_9.json'
import Advp1_18_03_2026 from './tests/Advp1_18_03_2026.json'
import Advp2_18_03_2026 from './tests/Advp2_18_03_2026.json'
import module_10 from './tests/module_10.json'
import module_11 from './tests/module_11.json'

export const TESTS: TestMetadata[] = [
  { id: '1', name: 'Testing 123', fileName: 'testing123.json' },
  { id: '2', name: 'Module 2', fileName: 'module_2.json' },
  { id: '3', name: 'Advp1_15_02_2026', fileName: 'Advp1_15_02_2026.json' },
  { id: '4', name: 'Advp1_22_02_2026', fileName: 'Advp1_22_02_2026.json' },
  { id: '5', name: 'Module 4', fileName: 'module_4.json' },
  { id: '6', name: 'Advp2_22_02_2026', fileName: 'Advp2_22_02_2026.json' },
  { id: '7', name: 'Module 5', fileName: 'module_5.json' },
  { id: '8', name: 'Advp1_1_03_2026', fileName: 'Advp1_1_03_2026.json' },
  { id: '9', name: 'Advp2_1_03_2026', fileName: 'Advp2_1_03_2026.json' },
  { id: '10', name: 'Module 6', fileName: 'module_6.json' },
  { id: '11', name: 'Module 7', fileName: 'module_7.json' },
  { id: '12', name: 'Module 8', fileName: 'module_8.json' },
  { id: '13', name: 'Module 9', fileName: 'module_9.json' },
  { id: '14', name: 'Advp1_18_03_2026', fileName: 'Advp1_18_03_2026.json' },
  { id: '15', name: 'Advp2_18_03_2026', fileName: 'Advp2_18_03_2026.json' },
  { id: '16', name: 'Module 10', fileName: 'module_10.json' },
  { id: '17', name: 'Module 11', fileName: 'module_11.json' },
];

export const MOCK_TEST_DATA: Record<string, TestData> = {
  'testing123.json': testing123 as TestData,
  'module_2.json': module_2 as TestData,
  'Advp1_15_02_2026.json': Advp1_15_02_2026 as TestData,
  'Advp1_22_02_2026.json': Advp1_22_02_2026 as TestData,
  'module_4.json': module_4 as TestData,
  'Advp2_22_02_2026.json': Advp2_22_02_2026 as TestData,
  'module_5.json': module_5 as TestData,
  'Advp1_1_03_2026.json': Advp1_1_03_2026 as TestData,
  'Advp2_1_03_2026.json': Advp2_1_03_2026 as TestData,
  'module_6.json': module_6 as TestData,
  'module_7.json': module_7 as TestData,
  'module_8.json': module_8 as TestData,
  'module_9.json': module_9 as TestData,
  'Advp1_18_03_2026.json': Advp1_18_03_2026 as TestData,
  'Advp2_18_03_2026.json': Advp2_18_03_2026 as TestData,
  'module_10.json': module_10 as TestData,
  'module_11.json': module_11 as TestData,
};