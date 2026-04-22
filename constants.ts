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
import module_12 from './tests/module_12.json' 
import CFT_2 from './tests/CFT-2.json'
import module_13 from './tests/module_13.json'
import CFT_3 from './tests/CFT-3.json'
import CFT_4 from './tests/CFT-4.json'
import CFT_5 from './tests/CFT-5.json'
import CFT_6 from './tests/CFT-6.json'
import CFT_7 from './tests/CFT-7.json'
import CFT_8 from './tests/CFT-8.json'
import CFT_9 from './tests/CFT-9.json'
import module_14 from './tests/module_14.json'
import CAdv1 from './tests/CAdv1.json'
import module_15 from './tests/module_15.json'
import module_16 from './tests/module_16.json'
import CAdv2 from './tests/CAdv2.json'
import module_17 from './tests/module_17.json'
import module_18 from './tests/module_18.json'
import CAdv3 from './tests/CAdv3.json'

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
  { id: '18', name: 'Module 12', fileName: 'module_12.json' },
  { id: '19', name: 'CFT-2', fileName: 'CFT-2.json' },
  { id: '20', name: 'Module 13', fileName: 'module_13.json' },
  { id: '21', name: 'CFT-3', fileName: 'CFT-3.json' },
  { id: '22', name: 'CFT-4', fileName: 'CFT-4.json' },
  { id: '23', name: 'CFT-5', fileName: 'CFT-5.json' },
  { id: '24', name: 'CFT-6', fileName: 'CFT-6.json' },
  { id: '25', name: 'CFT-7', fileName: 'CFT-7.json' },
  { id: '26', name: 'CFT-8', fileName: 'CFT-8.json' },
  { id: '27', name: 'CFT-9', fileName: 'CFT-9.json' },
  { id: '28', name: 'Module 14', fileName: 'module_14.json' },
  { id: '29', name: 'CAdv1', fileName: 'CAdv1.json' },
  { id: '30', name: 'Module 15', fileName: 'module_15.json' },
  { id: '31', name: 'Module 16', fileName: 'module_16.json' },
  { id: '32', name: 'CAdv2', fileName: 'CAdv2.json' },
  { id: '33', name: 'Module 17', fileName: 'module_17.json' },
  { id: '34', name: 'Module 18', fileName: 'module_18.json' },
  { id: '35', name: 'CAdv3', fileName: 'CAdv3.json' }
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
  'module_12.json': module_12 as TestData,
  'CFT-2.json': CFT_2 as TestData,
  'module_13.json': module_13 as TestData,
  'CFT-3.json': CFT_3 as TestData,
  'CFT-4.json': CFT_4 as TestData,
  'CFT-5.json': CFT_5 as TestData,
  'CFT-6.json': CFT_6 as TestData,
  'CFT-7.json': CFT_7 as TestData,
  'CFT-8.json': CFT_8 as TestData,
  'CFT-9.json': CFT_9 as TestData,
  'module_14.json': module_14 as TestData,
  'CAdv1.json': CAdv1 as TestData,
  'module_15.json': module_15 as TestData,
  'module_16.json': module_16 as TestData,
  'CAdv2.json': CAdv2 as TestData,
  'module_17.json': module_17 as TestData,
  'module_18.json': module_18 as TestData,
  'CAdv3.json': CAdv3 as TestData
};