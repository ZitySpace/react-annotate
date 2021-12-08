/* eslint-disable camelcase */
import * as React from 'react'
import { fabric } from 'fabric'
import Draggable from 'react-draggable'
// import { PinchGesture } from '@use-gesture/vanilla'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  XIcon,
  MenuAlt2Icon,
  MenuAlt3Icon,
  MenuAlt4Icon,
  MenuIcon,
  TrashIcon,
  ReplyIcon,
  CheckIcon,
  RefreshIcon,
  PencilIcon,
  CogIcon,
  TagIcon,
  HandIcon
} from '@heroicons/react/solid'
import { useRef, useState } from 'react'
import { HeavyFloppyIcon } from './components/icons'

// TODO: mock data remove
const imgObj = {
  id: 24,
  file_name: '000000015746.jpg',
  file_size: 196039,
  image_width: 427,
  image_height: 640,
  image_area: 273280,
  upload_time: '2021-11-10T10:28:44+00:00',
  annotations: [
    {
      x: 72,
      y: 198,
      w: 279,
      h: 378,
      category: 'fire hydrant',
      timestamp_z: '2021-11-12T22:04:03',
      unique_hash_z: '241e823d6867aca577c3d7f72c5bd3db',
      text_id: 0
    }
  ],
  name: '000000015746.jpg',
  idxInPage: 23,
  selected: false,
  blobSrc:
    'https://images.unsplash.com/photo-1495954147468-729898cbe8aa?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8YmlnfGVufDB8fDB8fA%3D%3D&w=1000&q=80'
}

const pagingData = [
  {
    id: 1,
    file_name: '000000001532.jpg',
    file_size: 174022,
    image_width: 640,
    image_height: 480,
    image_area: 307200,
    upload_time: '2021-11-10T10:28:43+00:00',
    annotations: [
      {
        x: 1,
        y: 370,
        w: 119,
        h: 102,
        category: 'car',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '0fb2738766f703e5e6f74b35c5d5260e'
      },
      {
        x: 502,
        y: 397,
        w: 50,
        h: 46,
        category: 'car',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'e0a161934d946b03b68869ba4281f4ba'
      },
      {
        x: 201,
        y: 402,
        w: 33,
        h: 26,
        category: 'car',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '563ecab0dc51d21101d685197085a285'
      },
      {
        x: 106,
        y: 376,
        w: 79,
        h: 60,
        category: 'car',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '2252765c68f86be8b109fc144a8f2bf6'
      },
      {
        x: 226,
        y: 391,
        w: 20,
        h: 16,
        category: 'truck',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '5868f150062aa73d182ac47b1d4b30e8'
      },
      {
        x: 426,
        y: 400,
        w: 64,
        h: 55,
        category: 'car',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'be436047cb26f532b8ba386c9fd1283b'
      },
      {
        x: 406,
        y: 402,
        w: 25,
        h: 28,
        category: 'car',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '53a10f5d35894eb1653a149f424c7918'
      },
      {
        x: 225,
        y: 362,
        w: 195,
        h: 118,
        category: 'car',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '122812fc2f4dfcc4ed1be8a86e401043'
      }
    ],
    name: '000000001532.jpg',
    idxInPage: 1,
    selected: false,
    blobSrc: 'blob:http://localhost/e1cf3521-0aac-4b7f-8180-25645364452d'
  },
  {
    id: 2,
    file_name: '000000002006.jpg',
    file_size: 202589,
    image_width: 640,
    image_height: 480,
    image_area: 307200,
    upload_time: '2021-11-10T10:28:43+00:00',
    annotations: [
      {
        x: 46,
        y: 81,
        w: 563,
        h: 345,
        category: 'bus',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '8a94019700b3cb33c8139e3cbb9da671'
      },
      {
        x: 313,
        y: 190,
        w: 65,
        h: 67,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'a42d4f13a59e595e7dd27e4932beb20e'
      },
      {
        x: 5,
        y: 253,
        w: 46,
        h: 108,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '90a3d51e84a5694a26577a0689af1c4e'
      },
      {
        x: 334,
        y: 219,
        w: 14,
        h: 15,
        category: 'tie',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'c64d3d2c0a4d728e05fc5ee23db93112'
      },
      {
        x: 27,
        y: 273,
        w: 5,
        h: 32,
        category: 'tie',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '188690959655b6382acab731ba85c9e1'
      },
      {
        x: 9,
        y: 52,
        w: 24,
        h: 24,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'a77d31944a4ee717e7129cb07af92590'
      },
      {
        x: 56,
        y: 0,
        w: 13,
        h: 31,
        category: 'traffic light',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '75268559ca5ea79911b8dd71718ca45c'
      },
      {
        x: 122,
        y: 65,
        w: 6,
        h: 11,
        category: 'traffic light',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '7a5aaac2863d3610afe89512e769032a'
      }
    ],
    name: '000000002006.jpg',
    idxInPage: 2,
    selected: false,
    blobSrc: 'blob:http://localhost/40b700fe-f6d7-4ab0-a0b3-29e381f62806'
  },
  {
    id: 4,
    file_name: '000000005193.jpg',
    file_size: 102722,
    image_width: 640,
    image_height: 425,
    image_area: 272000,
    upload_time: '2021-11-10T10:28:43+00:00',
    annotations: [
      {
        x: 139,
        y: 113,
        w: 109,
        h: 281,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'df6a203a28899c04a2b07930b6ba0aa9'
      },
      {
        x: 2,
        y: 90,
        w: 217,
        h: 330,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '2501905e420bb947e69fb26d1f200018'
      },
      {
        x: 224,
        y: 64,
        w: 37,
        h: 123,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'eb1d55c50b23e014ba21ac7b3d075c4d'
      },
      {
        x: 377,
        y: 99,
        w: 204,
        h: 191,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'a83ebf9d149021e053ce501b4d32ae9d'
      },
      {
        x: 289,
        y: 172,
        w: 120,
        h: 229,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '0ccb99c5a76f4aa2f5c5c049daac3896'
      },
      {
        x: 239,
        y: 65,
        w: 99,
        h: 350,
        category: 'surfboard',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'd9997b68e350f5fd2e2e944fd3f1cda5'
      },
      {
        x: 460,
        y: 73,
        w: 104,
        h: 264,
        category: 'surfboard',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '043375fdd2267814625c6a2967751681'
      },
      {
        x: 369,
        y: 98,
        w: 20,
        h: 75,
        category: 'bottle',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '6adaab913d0f2abe69cc2ee9d4d09eb4'
      },
      {
        x: 360,
        y: 221,
        w: 127,
        h: 154,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'c045005e69f0b33355e74aaa35d6d490'
      }
    ],
    name: '000000005193.jpg',
    idxInPage: 3,
    selected: false,
    blobSrc: 'blob:http://localhost/e52c1b02-2d89-4d60-aea5-cd68b77d19d9'
  },
  {
    id: 5,
    file_name: '000000006471.jpg',
    file_size: 96115,
    image_width: 500,
    image_height: 333,
    image_area: 166500,
    upload_time: '2021-11-10T10:28:43+00:00',
    annotations: [
      {
        x: 258,
        y: 64,
        w: 97,
        h: 233,
        category: 'person',
        timestamp_z: '2021-12-01T16:27:35',
        unique_hash_z: '143f91b3d887c2bcabe4432f15873f7f'
      },
      {
        x: 87,
        y: 185,
        w: 154,
        h: 140,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '72efc88d842482d9ff4b2875d322deff'
      },
      {
        x: 87,
        y: 71,
        w: 67,
        h: 69,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'b6dab575616f8ca421beed21e3faf452'
      },
      {
        x: 169,
        y: 74,
        w: 53,
        h: 57,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '0b89ecaf31020a61c74ff4816add4bad'
      },
      {
        x: 387,
        y: 60,
        w: 88,
        h: 53,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '6c67e7dc92b730166706117a4dcf1dae'
      },
      {
        x: 216,
        y: 76,
        w: 47,
        h: 54,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'c1520fce7bfcdfebaeee6e3444deb83b'
      },
      {
        x: 302,
        y: 28,
        w: 62,
        h: 70,
        category: 'baseball bat',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '7974d43711eb4647938b422c52a32174'
      },
      {
        x: 40,
        y: 0,
        w: 37,
        h: 14,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '8978fd9149cd6043a82aa4ae5116ec62'
      },
      {
        x: 138,
        y: 116,
        w: 54,
        h: 19,
        category: 'bench',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'ca10045d94adf7a468c1fcad0d5b5bab'
      },
      {
        x: 341,
        y: 98,
        w: 79,
        h: 21,
        category: 'bench',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '0fca92b18feb2142f06ed097b8ceb4f2'
      },
      {
        x: 214,
        y: 230,
        w: 29,
        h: 33,
        category: 'baseball glove',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '64264151972d808a1e649530bb521b0c'
      },
      {
        x: 147,
        y: 103,
        w: 5,
        h: 16,
        category: 'bottle',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '80386d2e45577cf2f7717d7561b6d4ac'
      },
      {
        x: 18,
        y: 97,
        w: 51,
        h: 52,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'ec28defa8f75734904e3ddfdea6bcc69'
      },
      {
        x: 49,
        y: 81,
        w: 53,
        h: 63,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '3e28e0dc07b6ff60ee952bceedd6e99a'
      },
      {
        x: 86,
        y: 107,
        w: 5,
        h: 16,
        category: 'bottle',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'bda04d3ae6a53d2891991c79cde36cc4'
      },
      {
        x: 17,
        y: 142,
        w: 110,
        h: 182,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '7b464ae8696ffb4e92ba30d2c4033fab'
      }
    ],
    name: '000000006471.jpg',
    idxInPage: 4,
    selected: false,
    blobSrc: 'blob:http://localhost/f5854ffb-221b-4739-818c-c58ac362ce01'
  },
  {
    id: 6,
    file_name: '000000006894.jpg',
    file_size: 119456,
    image_width: 640,
    image_height: 480,
    image_area: 307200,
    upload_time: '2021-11-10T10:28:43+00:00',
    annotations: [
      {
        x: 293,
        y: 20,
        w: 347,
        h: 460,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '56cebb31380f8864a16bd1d4d78e978a'
      },
      {
        x: 0,
        y: 86,
        w: 639,
        h: 388,
        category: 'elephant',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '0809cd4a43c4cd07f8f653e83b157e41'
      }
    ],
    name: '000000006894.jpg',
    idxInPage: 5,
    selected: false,
    blobSrc: 'blob:http://localhost/d6dd9acf-0232-432a-b76b-afb0a8fa3890'
  },
  {
    id: 7,
    file_name: '000000007784.jpg',
    file_size: 65621,
    image_width: 500,
    image_height: 375,
    image_area: 187500,
    upload_time: '2021-11-10T10:28:43+00:00',
    annotations: [
      {
        x: 94,
        y: 86,
        w: 240,
        h: 220,
        category: 'kite',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'a853af7005c12cd3e9392444de47dfcc'
      }
    ],
    name: '000000007784.jpg',
    idxInPage: 6,
    selected: false,
    blobSrc: 'blob:http://localhost/63be6ee7-4aa7-41bf-a8e0-9e955bf93219'
  },
  {
    id: 8,
    file_name: '000000007816.jpg',
    file_size: 171711,
    image_width: 640,
    image_height: 427,
    image_area: 273280,
    upload_time: '2021-11-10T10:28:43+00:00',
    annotations: [
      {
        x: 241,
        y: 153,
        w: 226,
        h: 207,
        category: 'motorcycle',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '47b6d1da511b3c71d5bdebf586dc94f2'
      },
      {
        x: 491,
        y: 56,
        w: 28,
        h: 107,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '01564e1329ff0525b6c882cd308a792f'
      },
      {
        x: 564,
        y: 59,
        w: 23,
        h: 115,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '3c32d8ac6e71dcc3ef0f1137a13c441d'
      },
      {
        x: 573,
        y: 54,
        w: 25,
        h: 29,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '347576ba07e977c3323b7782ba78126c'
      },
      {
        x: 581,
        y: 47,
        w: 40,
        h: 139,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '2b024f87d7d6f71214d0272e4c2e2e93'
      },
      {
        x: 416,
        y: 123,
        w: 64,
        h: 53,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'b7f3243d873671064892c0ae8c0e0d19'
      },
      {
        x: 506,
        y: 53,
        w: 39,
        h: 112,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '88a0b581dda629592af782ace73bf73b'
      },
      {
        x: 362,
        y: 108,
        w: 22,
        h: 42,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'ed51b191af445bd056071fc202234b9d'
      },
      {
        x: 386,
        y: 147,
        w: 33,
        h: 21,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'a37d605d9123662a2c8d9ab858880813'
      },
      {
        x: 247,
        y: 33,
        w: 51,
        h: 110,
        category: 'person',
        timestamp_z: '2021-11-20T22:16:38',
        unique_hash_z: '3fbd460d57da8997018bb2eb3d05ceb2'
      },
      {
        x: 271,
        y: 78,
        w: 184,
        h: 199,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'd72f7dd27fcb7e632e683ec0a524db7a'
      }
    ],
    name: '000000007816.jpg',
    idxInPage: 7,
    selected: false,
    blobSrc: 'blob:http://localhost/f545204b-5d98-4c25-bfbf-f2d32cd29e75'
  },
  {
    id: 9,
    file_name: '000000007977.jpg',
    file_size: 206738,
    image_width: 429,
    image_height: 640,
    image_area: 274560,
    upload_time: '2021-11-10T10:28:43+00:00',
    annotations: [
      {
        x: 104,
        y: 145,
        w: 158,
        h: 276,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'e464f8ecf5172edfaa5d74658407c03c'
      },
      {
        x: 200,
        y: 346,
        w: 68,
        h: 81,
        category: 'skateboard',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'af7d69b51290dccc06552d86530c5c10'
      },
      {
        x: 67,
        y: 210,
        w: 8,
        h: 14,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '401bb904657cd32cccd15d12b3db4bf9'
      },
      {
        x: 43,
        y: 210,
        w: 7,
        h: 14,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '4b9af2325ce14b0d57f3f2938efc419a'
      },
      {
        x: 39,
        y: 213,
        w: 4,
        h: 10,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '4587b967ac66fdf32003ee7f6b2dafec'
      },
      {
        x: 80,
        y: 208,
        w: 7,
        h: 17,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '2270a8c70054970861b80f4d54a4816f'
      }
    ],
    name: '000000007977.jpg',
    idxInPage: 8,
    selected: false,
    blobSrc: 'blob:http://localhost/a8aa1d84-197a-45e5-a9ce-25e633a37d42'
  },
  {
    id: 10,
    file_name: '000000008277.jpg',
    file_size: 206878,
    image_width: 612,
    image_height: 612,
    image_area: 374544,
    upload_time: '2021-11-10T10:28:43+00:00',
    annotations: [
      {
        x: 387,
        y: 84,
        w: 225,
        h: 310,
        category: 'fork',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'b306b2dcbceeb080205873dec06a46c2'
      },
      {
        x: 19,
        y: 34,
        w: 446,
        h: 327,
        category: 'bowl',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'a8f79b3e6bf495e39033a90194b37f4f'
      },
      {
        x: 0,
        y: 71,
        w: 612,
        h: 541,
        category: 'bowl',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'b3175960d07f1b09c10c30be6727ace1'
      },
      {
        x: 271,
        y: 182,
        w: 92,
        h: 76,
        category: 'broccoli',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '87db526199e1af42121b492e9feb4512'
      },
      {
        x: 121,
        y: 159,
        w: 97,
        h: 84,
        category: 'broccoli',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '114f6b9dae52e76cf9255ca5c316f458'
      },
      {
        x: 209,
        y: 163,
        w: 70,
        h: 108,
        category: 'broccoli',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '804b38d1f3f4865461ae07859fa43017'
      },
      {
        x: 268,
        y: 120,
        w: 52,
        h: 54,
        category: 'broccoli',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'c11ceee25867ce84ee58311fbc15c2e6'
      },
      {
        x: 360,
        y: 211,
        w: 26,
        h: 54,
        category: 'broccoli',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'abb452b78a1b26e46adc32469831967f'
      },
      {
        x: 195,
        y: 254,
        w: 75,
        h: 62,
        category: 'broccoli',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '349c1b6a5b606af27d6b2d7e528b0b17'
      },
      {
        x: 203,
        y: 83,
        w: 80,
        h: 85,
        category: 'broccoli',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'b0a4f19c7f6cbe9c579c0eba27519a80'
      },
      {
        x: 291,
        y: 98,
        w: 62,
        h: 71,
        category: 'broccoli',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'a49c5a638c29bad5943130bca6b88768'
      },
      {
        x: 258,
        y: 227,
        w: 88,
        h: 71,
        category: 'broccoli',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '5af91a1ff6848551959df2058a371493'
      },
      {
        x: 278,
        y: 149,
        w: 102,
        h: 68,
        category: 'broccoli',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '057207ea333164a1d7e9933963effc71'
      }
    ],
    name: '000000008277.jpg',
    idxInPage: 9,
    selected: false,
    blobSrc: 'blob:http://localhost/cd99b19c-fbeb-45ed-9f77-8acb55a5b60f'
  },
  {
    id: 11,
    file_name: '000000008844.jpg',
    file_size: 111826,
    image_width: 640,
    image_height: 426,
    image_area: 272640,
    upload_time: '2021-11-10T10:28:43+00:00',
    annotations: [
      {
        x: 356,
        y: 58,
        w: 225,
        h: 219,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '94aa7743bedd665e414558e3f935a2de'
      },
      {
        x: 534,
        y: 242,
        w: 30,
        h: 79,
        category: 'banana',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '011f5f5aeec3f52e52b8d6c0b9c47a86'
      },
      {
        x: 544,
        y: 259,
        w: 94,
        h: 134,
        category: 'banana',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'e45a7c93787b1103dc8c43dd1cb43f65'
      },
      {
        x: 0,
        y: 116,
        w: 388,
        h: 301,
        category: 'banana',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '63959e4a81d294a357e7272e612cb5d5'
      },
      {
        x: 371,
        y: 244,
        w: 172,
        h: 140,
        category: 'banana',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'd242f95e20f5cdb59f96bb1a76141a49'
      },
      {
        x: 341,
        y: 186,
        w: 28,
        h: 62,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'b4205f98e1acc47590977b64b131442c'
      },
      {
        x: 293,
        y: 184,
        w: 43,
        h: 44,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '93a822c59cabf8845ec44d7673259413'
      }
    ],
    name: '000000008844.jpg',
    idxInPage: 10,
    selected: false,
    blobSrc: 'blob:http://localhost/1f7c0f9d-8dc7-445b-a5ce-df686e06c434'
  },
  {
    id: 12,
    file_name: '000000009378.jpg',
    file_size: 117675,
    image_width: 600,
    image_height: 400,
    image_area: 240000,
    upload_time: '2021-11-10T10:28:43+00:00',
    annotations: [
      {
        x: 67,
        y: 45,
        w: 406,
        h: 349,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'eafad55e4b94b2f7efe8623fcbfd63ac'
      },
      {
        x: 308,
        y: 331,
        w: 86,
        h: 61,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'd23ae4203f075bc64540cb543b8a094e'
      },
      {
        x: 425,
        y: 337,
        w: 55,
        h: 53,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'c35cf3fd17b5ff0fbbf57f9b1dd61bc3'
      },
      {
        x: 526,
        y: 296,
        w: 62,
        h: 79,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'c9f851038405f0052061ba0baef2129d'
      },
      {
        x: 190,
        y: 217,
        w: 169,
        h: 41,
        category: 'frisbee',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'cd196d24a4b8a0cd0481cb002d26673e'
      },
      {
        x: 31,
        y: 363,
        w: 29,
        h: 27,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '3b1d135d4ee693a36e4a9c0323ff4cad'
      },
      {
        x: 491,
        y: 322,
        w: 45,
        h: 69,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'f198e07c0c9c9666c01d0ecacf963625'
      },
      {
        x: 522,
        y: 319,
        w: 29,
        h: 40,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'bd825e7e14d5a47c25735485fbd3e3f5'
      },
      {
        x: 10,
        y: 361,
        w: 25,
        h: 31,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '0bcdf095a291a5a9261e85651f101a69'
      },
      {
        x: 421,
        y: 350,
        w: 20,
        h: 39,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'ba8b4ca15d9b695f7b57444a3f02f59b'
      }
    ],
    name: '000000009378.jpg',
    idxInPage: 11,
    selected: false,
    blobSrc: 'blob:http://localhost/10cff267-bfb4-44ad-bcc4-e55b7359dc81'
  },
  {
    id: 13,
    file_name: '000000009590.jpg',
    file_size: 155925,
    image_width: 640,
    image_height: 427,
    image_area: 273280,
    upload_time: '2021-11-10T10:28:44+00:00',
    annotations: [
      {
        x: 427,
        y: 228,
        w: 24,
        h: 49,
        category: 'bottle',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '0ef900a02166b0b03d95d802b1d01ad0'
      },
      {
        x: 179,
        y: 98,
        w: 21,
        h: 26,
        category: 'clock',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'ba5f5439190d3a523b0216db7f655c84'
      },
      {
        x: 179,
        y: 254,
        w: 461,
        h: 164,
        category: 'dining table',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '25d7aead1793a05d978d50e26daa46f3'
      },
      {
        x: 136,
        y: 156,
        w: 95,
        h: 138,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '3e45c1a9e9d55ca7f822e33fffcd92ce'
      },
      {
        x: 259,
        y: 178,
        w: 64,
        h: 76,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '14e565161aec6e79437227cdbda18d5d'
      },
      {
        x: 0,
        y: 53,
        w: 237,
        h: 374,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'fd8c2f8e690a89f7e887ba71e919154d'
      },
      {
        x: 347,
        y: 271,
        w: 39,
        h: 39,
        category: 'cup',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '33cb638312ebe68dc055b99f15b5db10'
      },
      {
        x: 523,
        y: 238,
        w: 59,
        h: 54,
        category: 'cup',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '91c40eaf26653c47ebc7020c7b2865c3'
      },
      {
        x: 363,
        y: 299,
        w: 52,
        h: 12,
        category: 'spoon',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '3db0e61c209081f474e1cf92c7aa50bf'
      },
      {
        x: 534,
        y: 368,
        w: 57,
        h: 59,
        category: 'spoon',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '1b245cc0184f183ca0f0bf41141f286f'
      },
      {
        x: 424,
        y: 276,
        w: 48,
        h: 30,
        category: 'bowl',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'e1d0390817d8a8767046bc45fd8919c4'
      },
      {
        x: 338,
        y: 257,
        w: 66,
        h: 16,
        category: 'bowl',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '3e7e1e4bfe6707e75f23600ffb3efaa8'
      },
      {
        x: 288,
        y: 274,
        w: 36,
        h: 20,
        category: 'bowl',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '097ce501f1e788d5ac1f266906aac7d8'
      },
      {
        x: 243,
        y: 258,
        w: 25,
        h: 15,
        category: 'bowl',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '2fd551e0f9d23f0e02e9f0532ed38fe4'
      },
      {
        x: 384,
        y: 272,
        w: 36,
        h: 28,
        category: 'bowl',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '265ccc2b79652d9207b5717559d763ba'
      },
      {
        x: 372,
        y: 169,
        w: 86,
        h: 98,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '6bb93a44781fa1c207535652c260b787'
      },
      {
        x: 541,
        y: 215,
        w: 26,
        h: 22,
        category: 'cup',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '6373d802bc6ca1c79a85bd66f13e8795'
      },
      {
        x: 467,
        y: 263,
        w: 25,
        h: 37,
        category: 'cup',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '8933a3dd05c13f69bb22976ef6139356'
      },
      {
        x: 185,
        y: 280,
        w: 23,
        h: 26,
        category: 'cup',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '6eb6021d86166583573acddeb9bb8c0c'
      },
      {
        x: 416,
        y: 257,
        w: 14,
        h: 17,
        category: 'bowl',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '3d76285ce6d5e5cdcd28c60037104376'
      },
      {
        x: 131,
        y: 236,
        w: 13,
        h: 33,
        category: 'chair',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'b5b8902adb838de02894c513dee0c3f8'
      },
      {
        x: 243,
        y: 348,
        w: 120,
        h: 73,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '50ae9beaf28764ed62750cb438f97a56'
      },
      {
        x: 423,
        y: 275,
        w: 48,
        h: 31,
        category: 'cup',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '791ed9a16508c62bbd623c6bb8747cd9'
      },
      {
        x: 325,
        y: 251,
        w: 21,
        h: 15,
        category: 'cup',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '9dd9df93b673dcef46ad287f1c53eb70'
      },
      {
        x: 479,
        y: 259,
        w: 44,
        h: 20,
        category: 'cup',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '656cdf29374dffe93982342dff2d4aff'
      },
      {
        x: 251,
        y: 250,
        w: 25,
        h: 20,
        category: 'cup',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'a5487307cd3b0d1a97f417f361d309a3'
      },
      {
        x: 552,
        y: 301,
        w: 29,
        h: 10,
        category: 'spoon',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '6ffdae2b9d481dfdf18c882730043982'
      },
      {
        x: 513,
        y: 110,
        w: 127,
        h: 177,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '8cc408a2ce65b5cc98002a7b69fe78a7'
      },
      {
        x: 302,
        y: 234,
        w: 26,
        h: 30,
        category: 'cup',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '13d81cd9421cfe9769874fe52ecf3843'
      }
    ],
    name: '000000009590.jpg',
    idxInPage: 12,
    selected: false,
    blobSrc: 'blob:http://localhost/ebd46a2c-f682-4995-88eb-ff1d0912a2ed'
  },
  {
    id: 14,
    file_name: '000000010764.jpg',
    file_size: 202945,
    image_width: 640,
    image_height: 424,
    image_area: 271360,
    upload_time: '2021-11-10T10:28:44+00:00',
    annotations: [
      {
        x: 219,
        y: 81,
        w: 265,
        h: 315,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '3389381fca8f93df319a6efb11911cb5'
      },
      {
        x: 389,
        y: 211,
        w: 95,
        h: 67,
        category: 'baseball glove',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'b434982dff5a0868b7a502de07164a84'
      }
    ],
    name: '000000010764.jpg',
    idxInPage: 13,
    selected: false,
    blobSrc: 'blob:http://localhost/8f5322f6-18bb-4121-82b9-05c85ba7618c'
  },
  {
    id: 15,
    file_name: '000000009769.jpg',
    file_size: 327350,
    image_width: 640,
    image_height: 480,
    image_area: 307200,
    upload_time: '2021-11-10T10:28:44+00:00',
    annotations: [
      {
        x: 140,
        y: 201,
        w: 44,
        h: 74,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'd604e6cf22a599c01ca667c2273c2fe6'
      },
      {
        x: 552,
        y: 259,
        w: 12,
        h: 21,
        category: 'fire hydrant',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '66b3a5aced3bcf9375cb32317dad4829'
      },
      {
        x: 311,
        y: 204,
        w: 40,
        h: 38,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'ef29cc294a1d9953c1685ebacf6c7217'
      },
      {
        x: 252,
        y: 200,
        w: 48,
        h: 35,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '291f516be28ce2f031d09a674d9efad8'
      },
      {
        x: 85,
        y: 188,
        w: 379,
        h: 189,
        category: 'truck',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'fb0f2cd571fbc20a16e6c99540a5c50e'
      }
    ],
    name: '000000009769.jpg',
    idxInPage: 14,
    selected: false,
    blobSrc: 'blob:http://localhost/eaa0cd7e-f9d1-4a38-9772-6e2f526b5e9c'
  },
  {
    id: 16,
    file_name: '000000010995.jpg',
    file_size: 73294,
    image_width: 640,
    image_height: 480,
    image_area: 307200,
    upload_time: '2021-11-10T10:28:44+00:00',
    annotations: [
      {
        x: 107,
        y: 213,
        w: 533,
        h: 262,
        category: 'bed',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'bd5b0a5112ccda435777dd95c7eca1a2'
      }
    ],
    name: '000000010995.jpg',
    idxInPage: 15,
    selected: false,
    blobSrc: 'blob:http://localhost/312b2fd5-8bc0-4b7e-af7a-47eed35593f4'
  },
  {
    id: 17,
    file_name: '000000011051.jpg',
    file_size: 80740,
    image_width: 640,
    image_height: 536,
    image_area: 343040,
    upload_time: '2021-11-10T10:28:44+00:00',
    annotations: [
      {
        x: 195,
        y: 198,
        w: 61,
        h: 227,
        category: 'tie',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '9cfc728af01c8c92ad3731c8ec15f57c'
      },
      {
        x: 249,
        y: 77,
        w: 385,
        h: 459,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'c03c795aef551fd7975356d941e0d4bc'
      },
      {
        x: 7,
        y: 2,
        w: 387,
        h: 525,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '91be2e53720c95bc4f9bfd050dfbe064'
      }
    ],
    name: '000000011051.jpg',
    idxInPage: 16,
    selected: false,
    blobSrc: 'blob:http://localhost/12f01706-6d43-4108-a885-34f32dbdbf7f'
  },
  {
    id: 18,
    file_name: '000000011122.jpg',
    file_size: 239715,
    image_width: 640,
    image_height: 480,
    image_area: 307200,
    upload_time: '2021-11-10T10:28:44+00:00',
    annotations: [
      {
        x: 250,
        y: 163,
        w: 80,
        h: 82,
        category: 'stop sign',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '323ee916faabdbc0435797db41273b10'
      }
    ],
    name: '000000011122.jpg',
    idxInPage: 17,
    selected: false,
    blobSrc: 'blob:http://localhost/8cc7b5f0-c840-474a-b7da-d5b200198568'
  },
  {
    id: 19,
    file_name: '000000012576.jpg',
    file_size: 244760,
    image_width: 480,
    image_height: 640,
    image_area: 307200,
    upload_time: '2021-11-10T10:28:44+00:00',
    annotations: [
      {
        x: 418,
        y: 42,
        w: 62,
        h: 83,
        category: 'tv',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '46b9acb88069b81f2bd28e27ea0b6477'
      },
      {
        x: 140,
        y: 201,
        w: 77,
        h: 145,
        category: 'cup',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'b85edfa6ddf06c2393c7b76c8412febb'
      },
      {
        x: 364,
        y: 209,
        w: 91,
        h: 168,
        category: 'cup',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '1add51f6514bb8927fc7b2b79139dbee'
      },
      {
        x: 317,
        y: 287,
        w: 163,
        h: 25,
        category: 'fork',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '6ca781ace32fd8da4f2a588521441203'
      },
      {
        x: 393,
        y: 403,
        w: 87,
        h: 90,
        category: 'knife',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '09694b26347ef335b1adf19550a6e05d'
      },
      {
        x: 0,
        y: 376,
        w: 450,
        h: 264,
        category: 'pizza',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '0362a82482cc9112381e71b02348e0d2'
      },
      {
        x: 272,
        y: 119,
        w: 39,
        h: 75,
        category: 'cup',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '1720730cad3a1eab897838085f7bcef1'
      },
      {
        x: 382,
        y: 113,
        w: 45,
        h: 58,
        category: 'cup',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'bf864913ad195be20d8116325e6c5a0b'
      },
      {
        x: 3,
        y: 319,
        w: 141,
        h: 19,
        category: 'fork',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '8b5cdda8b3784908bb4cc5d0c4e61fcd'
      },
      {
        x: 306,
        y: 191,
        w: 174,
        h: 44,
        category: 'pizza',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'b4073d3ca751450711a15b5f8302354a'
      },
      {
        x: 87,
        y: 173,
        w: 164,
        h: 55,
        category: 'pizza',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'a8f0f31818c82c7927a90c98c5de4770'
      },
      {
        x: 1,
        y: 101,
        w: 479,
        h: 528,
        category: 'dining table',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'b7181da8d963dcc6878d6e01ad67ccdc'
      },
      {
        x: 194,
        y: 15,
        w: 91,
        h: 136,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '05b4498319266ca772f9a39adadf11c6'
      },
      {
        x: 419,
        y: 371,
        w: 61,
        h: 71,
        category: 'fork',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'e8ed692fca735eedd4b5eeac25b2b853'
      },
      {
        x: 288,
        y: 303,
        w: 192,
        h: 18,
        category: 'knife',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'd0f5978971210ffa8420a31462ae8542'
      }
    ],
    name: '000000012576.jpg',
    idxInPage: 18,
    selected: false,
    blobSrc: 'blob:http://localhost/1ea3047b-4cd8-4e97-a0fd-75ca314093f0'
  },
  {
    id: 20,
    file_name: '000000012639.jpg',
    file_size: 276515,
    image_width: 480,
    image_height: 640,
    image_area: 307200,
    upload_time: '2021-11-10T10:28:44+00:00',
    annotations: [
      {
        x: 22,
        y: 310,
        w: 161,
        h: 246,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'f55d172f66a286e87388940b5e615f47'
      },
      {
        x: 24,
        y: 202,
        w: 83,
        h: 54,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '04c5f4e1d38f6a2c2c9b2cb7cb456cd2'
      },
      {
        x: 67,
        y: 173,
        w: 33,
        h: 58,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'eca98abbd971ce5b055a707d158dc6de'
      },
      {
        x: 87,
        y: 178,
        w: 27,
        h: 31,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '66ea58ae1099525cce6d0abf52bf1445'
      },
      {
        x: 122,
        y: 190,
        w: 32,
        h: 40,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '5bed5b49bd0375646b7cb3dbaefbb413'
      },
      {
        x: 170,
        y: 164,
        w: 32,
        h: 68,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '3c38934ebd9176c1b75531a99d192403'
      },
      {
        x: 230,
        y: 192,
        w: 20,
        h: 70,
        category: 'baseball bat',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '05331fcdd91a00b8bdbfc1ecbd118461'
      },
      {
        x: 311,
        y: 135,
        w: 22,
        h: 82,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '3d5a4d1da53e39a2ce55443f22710d48'
      },
      {
        x: 327,
        y: 171,
        w: 32,
        h: 50,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '449558baa79e2393860285537df55528'
      },
      {
        x: 133,
        y: 349,
        w: 52,
        h: 50,
        category: 'baseball glove',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '30709ad1a7171aff74c5dae2d564e657'
      },
      {
        x: 411,
        y: 125,
        w: 57,
        h: 168,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '79c5d5b64807e3d26ab3df0684acd0ff'
      },
      {
        x: 276,
        y: 194,
        w: 15,
        h: 12,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '8611a26a155f3e901c7d2cde8b8d76e3'
      },
      {
        x: 154,
        y: 194,
        w: 16,
        h: 37,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'afd0826a3e7fe8958d6efbe19669f65a'
      },
      {
        x: 99,
        y: 194,
        w: 48,
        h: 54,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '5656d69892c85221e675636a1efa1585'
      },
      {
        x: 199,
        y: 205,
        w: 118,
        h: 314,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '41d633ec02845e47bc2297e8d517665d'
      },
      {
        x: 22,
        y: 144,
        w: 287,
        h: 83,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'a49cc3646181f50752f8802923ea21ed'
      }
    ],
    name: '000000012639.jpg',
    idxInPage: 19,
    selected: false,
    blobSrc: 'blob:http://localhost/38e73408-dfbe-4597-9465-3153006eef56'
  },
  {
    id: 21,
    file_name: '000000012748.jpg',
    file_size: 192300,
    image_width: 480,
    image_height: 640,
    image_area: 307200,
    upload_time: '2021-11-10T10:28:44+00:00',
    annotations: [
      {
        x: 1,
        y: 50,
        w: 240,
        h: 505,
        category: 'horse',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '4da185acef8cfb318f5724111949c1e5'
      },
      {
        x: 217,
        y: 188,
        w: 263,
        h: 444,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '9399a7ca1549fb46d8bca1465a1a2cec'
      },
      {
        x: 221,
        y: 139,
        w: 259,
        h: 494,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'cb4b1c8a0515ac35a9146f48ab44e00c'
      }
    ],
    name: '000000012748.jpg',
    idxInPage: 20,
    selected: false,
    blobSrc: 'blob:http://localhost/7a29d267-18cc-424f-b8a1-982ec32a9686'
  },
  {
    id: 22,
    file_name: '000000014473.jpg',
    file_size: 166405,
    image_width: 640,
    image_height: 427,
    image_area: 273280,
    upload_time: '2021-11-10T10:28:44+00:00',
    annotations: [
      {
        x: 0,
        y: 155,
        w: 593,
        h: 154,
        category: 'train',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '766d3c7f781538260439f7d57625fabc'
      },
      {
        x: 320,
        y: 271,
        w: 15,
        h: 42,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'b0b0c4ecd305071a8a724161534c44c7'
      },
      {
        x: 277,
        y: 269,
        w: 21,
        h: 38,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '72a95730beb2c2c4044334ef42dfc871'
      },
      {
        x: 201,
        y: 259,
        w: 19,
        h: 37,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '18df1688db208224266f400e16f13824'
      },
      {
        x: 156,
        y: 254,
        w: 17,
        h: 34,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '0b22ce49fe350dcabbf3e50e25139575'
      },
      {
        x: 120,
        y: 246,
        w: 18,
        h: 35,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'febce27701abb3e6ae5840458dc90cec'
      },
      {
        x: 78,
        y: 246,
        w: 17,
        h: 27,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '97d8d142adf5116b0cdb9adfd753a876'
      },
      {
        x: 26,
        y: 225,
        w: 13,
        h: 36,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '55fdd850d84ac81fa836a57d0df1b914'
      }
    ],
    name: '000000014473.jpg',
    idxInPage: 21,
    selected: false,
    blobSrc: 'blob:http://localhost/acccfe82-8228-41fc-82fa-12dc408e6979'
  },
  {
    id: 23,
    file_name: '000000015597.jpg',
    file_size: 147400,
    image_width: 433,
    image_height: 640,
    image_area: 277120,
    upload_time: '2021-11-10T10:28:44+00:00',
    annotations: [
      {
        x: 104,
        y: 320,
        w: 93,
        h: 64,
        category: 'skateboard',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'c95ba554bac96396b807b84dabe47f47'
      },
      {
        x: 311,
        y: 421,
        w: 115,
        h: 42,
        category: 'bicycle',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'a5f03e93b3d0d895d1c4d47f0232eb7e'
      },
      {
        x: 9,
        y: 177,
        w: 195,
        h: 198,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'efd5f67dc9452fa42848688101c782bd'
      }
    ],
    name: '000000015597.jpg',
    idxInPage: 22,
    selected: false,
    blobSrc: 'blob:http://localhost/36e5b600-6e35-4a0e-9cb2-0dcb415d186e'
  },
  {
    id: 24,
    file_name: '000000015746.jpg',
    file_size: 196039,
    image_width: 427,
    image_height: 640,
    image_area: 273280,
    upload_time: '2021-11-10T10:28:44+00:00',
    annotations: [
      {
        x: 72.00000000000156,
        y: 198.00000000000006,
        w: 287.27994436978963,
        h: 389.1176016757919,
        category: 'fire hydrant',
        timestamp_z: '2021-12-13T14:21:47',
        unique_hash_z: '241e823d6867aca577c3d7f72c5bd3db',
        text_id: 0
      }
    ],
    name: '000000015746.jpg',
    idxInPage: 23,
    selected: false,
    blobSrc: 'blob:http://localhost/75a20b46-de43-4f60-bc44-d95bb8fce256'
  },
  {
    id: 25,
    file_name: '000000015751.jpg',
    file_size: 117087,
    image_width: 640,
    image_height: 427,
    image_area: 273280,
    upload_time: '2021-11-10T10:28:44+00:00',
    annotations: [
      {
        x: 152,
        y: 231,
        w: 146,
        h: 168,
        category: 'bird',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '3aa3e04fa44e534f71fc29ab7533d143'
      },
      {
        x: 107,
        y: 323,
        w: 46,
        h: 49,
        category: 'bird',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '9512c189c95f9419ef0a11ec7b9ea99d'
      },
      {
        x: 44,
        y: 347,
        w: 127,
        h: 50,
        category: 'bird',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '61ee500236885b16802b2eba944ae120'
      },
      {
        x: 223,
        y: 381,
        w: 47,
        h: 46,
        category: 'bird',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '5d7401b1921548783f4a7a78adc0c850'
      }
    ],
    name: '000000015751.jpg',
    idxInPage: 24,
    selected: false,
    blobSrc: 'blob:http://localhost/2137565e-7687-496c-9f79-9e2d235812d4'
  },
  {
    id: 26,
    file_name: '000000016249.jpg',
    file_size: 116588,
    image_width: 500,
    image_height: 365,
    image_area: 182500,
    upload_time: '2021-11-10T10:28:44+00:00',
    annotations: [
      {
        x: 43,
        y: 117,
        w: 148,
        h: 233,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '3bcb69d6a38e50a27fb350b48c2d44b3'
      },
      {
        x: 275,
        y: 38,
        w: 72,
        h: 126,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '19aab1e673a4780a485fede0990f5e40'
      },
      {
        x: 314,
        y: 99,
        w: 140,
        h: 183,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'af8e564e52c43753e5cfc9dea47ec4be'
      },
      {
        x: 422,
        y: 101,
        w: 78,
        h: 158,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '9fd471f90a0608936918f0a51806120b'
      },
      {
        x: 223,
        y: 200,
        w: 63,
        h: 113,
        category: 'bench',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'ad84cc46620b810db1856b711dfff9f0'
      },
      {
        x: 469,
        y: 99,
        w: 31,
        h: 46,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '303ae28d918efe0b967336d3557238e6'
      },
      {
        x: 29,
        y: 201,
        w: 143,
        h: 149,
        category: 'bench',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '73dc629bac95131bba912d37b748f83e'
      },
      {
        x: 376,
        y: 154,
        w: 94,
        h: 108,
        category: 'bench',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'b0c6bce9704fbfb9048d061a8cda9f98'
      },
      {
        x: 325,
        y: 182,
        w: 75,
        h: 99,
        category: 'bench',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'd7c961352e391b089fdbe4cc83eaa6fe'
      },
      {
        x: 275,
        y: 67,
        w: 29,
        h: 69,
        category: 'backpack',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'abac6fdbe7169eba3fe5c391072e9874'
      },
      {
        x: 427,
        y: 172,
        w: 47,
        h: 84,
        category: 'chair',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '0f47f574a2f16b2f32b953a40595e1d5'
      }
    ],
    name: '000000016249.jpg',
    idxInPage: 25,
    selected: false,
    blobSrc: 'blob:http://localhost/068e6547-38e2-4040-9388-fb10ce8a76e5'
  },
  {
    id: 27,
    file_name: '000000016502.jpg',
    file_size: 89819,
    image_width: 375,
    image_height: 500,
    image_area: 187500,
    upload_time: '2021-11-10T10:28:44+00:00',
    annotations: [
      {
        x: 75,
        y: 238,
        w: 108,
        h: 77,
        category: 'sheep',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'd3be5ca91df16e1191b7228159793a0b'
      }
    ],
    name: '000000016502.jpg',
    idxInPage: 26,
    selected: false,
    blobSrc: 'blob:http://localhost/3e00266a-153d-4f57-8a32-2851c8ca161a'
  },
  {
    id: 28,
    file_name: '000000017031.jpg',
    file_size: 113005,
    image_width: 500,
    image_height: 334,
    image_area: 167000,
    upload_time: '2021-11-10T10:28:44+00:00',
    annotations: [
      {
        x: 81,
        y: 35,
        w: 279,
        h: 299,
        category: 'giraffe',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'b9d6f3e44575cfa4161633cf8785fbdc'
      }
    ],
    name: '000000017031.jpg',
    idxInPage: 27,
    selected: false,
    blobSrc: 'blob:http://localhost/5dcd1f0f-0bac-4eec-aea9-94afc53ebfd9'
  },
  {
    id: 29,
    file_name: '000000017178.jpg',
    file_size: 166597,
    image_width: 640,
    image_height: 427,
    image_area: 273280,
    upload_time: '2021-11-10T10:28:44+00:00',
    annotations: [
      {
        x: 375,
        y: 174,
        w: 58,
        h: 94,
        category: 'horse',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '3b53d952fd8ab7a2500fabc3eb1ca216'
      },
      {
        x: 328,
        y: 161,
        w: 49,
        h: 100,
        category: 'horse',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '8faa649dc2bc86105c7f0324cacf5625'
      },
      {
        x: 256,
        y: 201,
        w: 58,
        h: 33,
        category: 'horse',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '5ecebba8a6b404e79286bb686d7b4a3f'
      },
      {
        x: 458,
        y: 175,
        w: 54,
        h: 36,
        category: 'horse',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '0fe3461170585f9abe27998414c867fc'
      },
      {
        x: 434,
        y: 108,
        w: 206,
        h: 319,
        category: 'car',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '557e22a34cb75ddbcfbc04f5eb2c8729'
      }
    ],
    name: '000000017178.jpg',
    idxInPage: 28,
    selected: false,
    blobSrc: 'blob:http://localhost/b18d5b3d-5ace-4c1c-a4f1-aa30e338fdb1'
  },
  {
    id: 30,
    file_name: '000000017182.jpg',
    file_size: 105405,
    image_width: 640,
    image_height: 428,
    image_area: 273920,
    upload_time: '2021-11-10T10:28:44+00:00',
    annotations: [
      {
        x: 185,
        y: 234,
        w: 65,
        h: 61,
        category: 'chair',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '7b58c1781cff94c0463401d18bcf8ddc'
      },
      {
        x: 240,
        y: 231,
        w: 59,
        h: 75,
        category: 'book',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'f05af79f1d0c6585bdea64cbbb078af7'
      },
      {
        x: 276,
        y: 229,
        w: 35,
        h: 72,
        category: 'book',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'd29415b1c6b89b3af391cd8c78d3d4cd'
      },
      {
        x: 293,
        y: 227,
        w: 29,
        h: 71,
        category: 'book',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '808afb0aace44f8ac28794c7c367da95'
      },
      {
        x: 305,
        y: 227,
        w: 29,
        h: 70,
        category: 'book',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '6a7c983d1cd2988c0eef42fefdc8e786'
      },
      {
        x: 315,
        y: 229,
        w: 31,
        h: 66,
        category: 'book',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '3f113cefb75f4bba121cc45a016adbd8'
      },
      {
        x: 318,
        y: 228,
        w: 38,
        h: 65,
        category: 'book',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'e2678bddff26a83424878bddc8010d2a'
      },
      {
        x: 428,
        y: 261,
        w: 28,
        h: 19,
        category: 'apple',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '3655bcf34c62b215c829de7536a2cb1c'
      }
    ],
    name: '000000017182.jpg',
    idxInPage: 29,
    selected: false,
    blobSrc: 'blob:http://localhost/b679115c-32ff-402e-a735-3ad46cfa8c21'
  },
  {
    id: 31,
    file_name: '000000017379.jpg',
    file_size: 179753,
    image_width: 478,
    image_height: 640,
    image_area: 305920,
    upload_time: '2021-11-10T10:28:44+00:00',
    annotations: [
      {
        x: 145,
        y: 214,
        w: 165,
        h: 108,
        category: 'tv',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '2f82fa12016ecc1ff3318c5795dab1b9'
      },
      {
        x: 380,
        y: 522,
        w: 98,
        h: 53,
        category: 'sink',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'd3e63dc5db3070e1f31921aef8e939d3'
      },
      {
        x: 4,
        y: 591,
        w: 186,
        h: 49,
        category: 'sink',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '63b2f1f36d3f3565e91ff664a35a82a7'
      },
      {
        x: 216,
        y: 233,
        w: 47,
        h: 80,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '5ed73dc638a62b7283670393d3e6ca1d'
      },
      {
        x: 158,
        y: 243,
        w: 40,
        h: 72,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '22d3d8cdda1c6dbbb3522bdc3462e757'
      }
    ],
    name: '000000017379.jpg',
    idxInPage: 30,
    selected: false,
    blobSrc: 'blob:http://localhost/bd42d0c8-3a3b-4c56-8286-4b92013303eb'
  },
  {
    id: 32,
    file_name: '000000017436.jpg',
    file_size: 129858,
    image_width: 481,
    image_height: 640,
    image_area: 307840,
    upload_time: '2021-11-10T10:28:44+00:00',
    annotations: [
      {
        x: 111,
        y: 490,
        w: 67,
        h: 145,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '7e19a694e6ac9fafb57cd405d0b2ed07'
      },
      {
        x: 22,
        y: 534,
        w: 156,
        h: 96,
        category: 'bench',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'dfc81815b64253033e12d8d929e10ecd'
      },
      {
        x: 230,
        y: 481,
        w: 29,
        h: 26,
        category: 'bench',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '869362ae66231cec13b6886de0f42ccb'
      }
    ],
    name: '000000017436.jpg',
    idxInPage: 31,
    selected: false,
    blobSrc: 'blob:http://localhost/66009ecf-c2a0-4ec8-91fe-b17a0461fbd4'
  },
  {
    id: 33,
    file_name: '000000017627.jpg',
    file_size: 186973,
    image_width: 640,
    image_height: 480,
    image_area: 307200,
    upload_time: '2021-11-10T10:28:44+00:00',
    annotations: [
      {
        x: 265,
        y: 235,
        w: 111,
        h: 67,
        category: 'car',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'b77ea188641a2f372d131a23563a56ed'
      },
      {
        x: 30,
        y: 233,
        w: 117,
        h: 94,
        category: 'car',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '00178672d25046cd5d67ecaf68288037'
      },
      {
        x: 27,
        y: 215,
        w: 78,
        h: 52,
        category: 'car',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '90903947354bddde21c138d37f008a0a'
      },
      {
        x: 168,
        y: 237,
        w: 102,
        h: 61,
        category: 'car',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '9b7e6300eb91ac7d255f3e27fee3f4d2'
      },
      {
        x: 412,
        y: 235,
        w: 72,
        h: 51,
        category: 'car',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '9d3363d606081631852d0140f72adb4b'
      },
      {
        x: 479,
        y: 235,
        w: 90,
        h: 50,
        category: 'car',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '97887cc8d768c5d2aef8d5b682c17c55'
      },
      {
        x: 1,
        y: 1,
        w: 155,
        h: 472,
        category: 'bus',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '78a55bc415bfa8207dc6ee5190fcfe73'
      },
      {
        x: 150,
        y: 224,
        w: 19,
        h: 72,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '48d360ae6146163402892c555e81fa5c'
      },
      {
        x: 259,
        y: 228,
        w: 14,
        h: 21,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '9f318e5acdf7fb97fbb3e452aa1ca038'
      },
      {
        x: 344,
        y: 228,
        w: 29,
        h: 27,
        category: 'car',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'e118db988f46631053871158af70bb34'
      },
      {
        x: 100,
        y: 242,
        w: 29,
        h: 35,
        category: 'car',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '1c2e9261574825695e5a588d316fe587'
      },
      {
        x: 598,
        y: 243,
        w: 42,
        h: 34,
        category: 'car',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '0f4c594b4f611dd5cc5fcf18a456b855'
      },
      {
        x: 552,
        y: 242,
        w: 35,
        h: 37,
        category: 'car',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'aa2d4f085a79481a0c0d826bca58c7b1'
      },
      {
        x: 460,
        y: 231,
        w: 68,
        h: 24,
        category: 'car',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'da826201197f9c78ee39b00ee323f387'
      },
      {
        x: 173,
        y: 235,
        w: 10,
        h: 30,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'a37cdc4975ebf996f0a700da7763940e'
      },
      {
        x: 187,
        y: 226,
        w: 16,
        h: 22,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '1d821b353deb37869813892df5ccca62'
      }
    ],
    name: '000000017627.jpg',
    idxInPage: 32,
    selected: false,
    blobSrc: 'blob:http://localhost/7efaa584-db8e-4acf-85c7-98cc942d8164'
  },
  {
    id: 34,
    file_name: '000000017959.jpg',
    file_size: 121659,
    image_width: 640,
    image_height: 427,
    image_area: 273280,
    upload_time: '2021-11-10T10:28:45+00:00',
    annotations: [
      {
        x: 2,
        y: 335,
        w: 27,
        h: 73,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '1c9a41aeda8e45144bf863b1ee9911cc'
      },
      {
        x: 123,
        y: 340,
        w: 23,
        h: 64,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '16a5016eb0db40c0839cf1000de67f21'
      },
      {
        x: 22,
        y: 330,
        w: 17,
        h: 74,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '244311bed3f5f3e0351a3b9a7663e314'
      },
      {
        x: 540,
        y: 346,
        w: 6,
        h: 15,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '0779a82e57f1cfa789e184d688572a30'
      },
      {
        x: 565,
        y: 345,
        w: 7,
        h: 13,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'cd1a7bbc54a93405c30fd3200514ec57'
      },
      {
        x: 572,
        y: 349,
        w: 6,
        h: 8,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '9aa73490f0dc00335eefb4cde6cd12f4'
      },
      {
        x: 592,
        y: 342,
        w: 6,
        h: 17,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '2e2285995609c938d033bcc4f7e2bed7'
      },
      {
        x: 450,
        y: 344,
        w: 8,
        h: 7,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '286018fe9be095bd1d0c8ea734d586eb'
      },
      {
        x: 241,
        y: 401,
        w: 24,
        h: 20,
        category: 'backpack',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '09fe1d6c75e7bbc9edf67975848d2bf7'
      },
      {
        x: 243,
        y: 122,
        w: 217,
        h: 108,
        category: 'kite',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'c9225fe190d94220f3ff3cd5cab9fec9'
      },
      {
        x: 446,
        y: 202,
        w: 154,
        h: 108,
        category: 'kite',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '0c8dbfbf4385e0b4f633fb8e24e8e629'
      },
      {
        x: 271,
        y: 177,
        w: 149,
        h: 90,
        category: 'kite',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '9969986ec09adb64ad039b4dc78e4132'
      },
      {
        x: 191,
        y: 272,
        w: 133,
        h: 126,
        category: 'kite',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'a7e4c1c342ffdf074769699d726750fb'
      },
      {
        x: 164,
        y: 141,
        w: 167,
        h: 203,
        category: 'kite',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '308b5e1e86d5ad735b6b2c91772c3ea0'
      },
      {
        x: 23,
        y: 204,
        w: 150,
        h: 205,
        category: 'kite',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'd88713d3a5ee6a49484b0f4d2b910ab8'
      },
      {
        x: 350,
        y: 95,
        w: 290,
        h: 182,
        category: 'kite',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '143ac371e50407a5056e14c14e4e8eaa'
      },
      {
        x: 272,
        y: 234,
        w: 54,
        h: 98,
        category: 'kite',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '727a5f32f5a13b159bad554114e03c5d'
      },
      {
        x: 331,
        y: 241,
        w: 49,
        h: 162,
        category: 'kite',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'd68af85df20c75869f1c774effe43a1b'
      },
      {
        x: 175,
        y: 385,
        w: 57,
        h: 11,
        category: 'kite',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'b132dea289cb2824a388d41eafeef3a4'
      },
      {
        x: 431,
        y: 349,
        w: 5,
        h: 12,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'b16613cbdf484c35d4db22989b7ccadd'
      },
      {
        x: 560,
        y: 341,
        w: 5,
        h: 13,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '6f57cb97be8590b8e10a636fee49b9af'
      },
      {
        x: 463,
        y: 347,
        w: 5,
        h: 14,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '1d40d238ce67fef6a5ce974369332472'
      },
      {
        x: 407,
        y: 347,
        w: 6,
        h: 15,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '756774a4de1fb38c5bb85da1dbb8b2aa'
      },
      {
        x: 605,
        y: 350,
        w: 5,
        h: 6,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '64961f0128db7a4557d2e6e9decd056d'
      },
      {
        x: 0,
        y: 132,
        w: 639,
        h: 239,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '6e8bbbe7fd97975ac88293e5ce18d360'
      }
    ],
    name: '000000017959.jpg',
    idxInPage: 33,
    selected: false,
    blobSrc: 'blob:http://localhost/a6367759-b2c3-4660-981c-9d97f198be44'
  },
  {
    id: 35,
    file_name: '000000019221.jpg',
    file_size: 112695,
    image_width: 640,
    image_height: 478,
    image_area: 305920,
    upload_time: '2021-11-10T10:28:45+00:00',
    annotations: [
      {
        x: 245,
        y: 339,
        w: 307,
        h: 135,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '9934601162f71164c268447c0bf420de'
      },
      {
        x: 85,
        y: 128,
        w: 363,
        h: 321,
        category: 'broccoli',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '3f951f39dcd2a1e8653c931d30b7fdbd'
      }
    ],
    name: '000000019221.jpg',
    idxInPage: 34,
    selected: false,
    blobSrc: 'blob:http://localhost/8aefe386-fc11-4b3f-96e4-8abc5a92f2bd'
  },
  {
    id: 36,
    file_name: '000000019432.jpg',
    file_size: 223434,
    image_width: 640,
    image_height: 480,
    image_area: 307200,
    upload_time: '2021-11-10T10:28:45+00:00',
    annotations: [
      {
        x: 344,
        y: 58,
        w: 72,
        h: 109,
        category: 'chair',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'd1ff48aa6b943156670094ce3a2dbc4e'
      },
      {
        x: 191,
        y: 16,
        w: 48,
        h: 42,
        category: 'chair',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '5aa59767d04b9435b8f8dcd9904e4e07'
      },
      {
        x: 522,
        y: 58,
        w: 74,
        h: 115,
        category: 'chair',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'bd69e8877787299fb7f03205c19ae845'
      },
      {
        x: 282,
        y: 16,
        w: 72,
        h: 150,
        category: 'chair',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '36dbe34a1eac722ea0d1d002616ed0b9'
      },
      {
        x: 357,
        y: 15,
        w: 63,
        h: 50,
        category: 'chair',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '956d234523abacf266914eeeef47f47e'
      },
      {
        x: 421,
        y: 14,
        w: 59,
        h: 48,
        category: 'chair',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'a6be37414c15c840f65d02d527124e84'
      },
      {
        x: 479,
        y: 15,
        w: 61,
        h: 51,
        category: 'chair',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '3010867abbe13639dc04cc227f019c5d'
      },
      {
        x: 412,
        y: 60,
        w: 55,
        h: 107,
        category: 'chair',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '53e3aa9539662b4791e89dc62b973e78'
      },
      {
        x: 225,
        y: 58,
        w: 68,
        h: 109,
        category: 'chair',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '64d62d05bd20e7f572faae25708fb0ea'
      },
      {
        x: 166,
        y: 57,
        w: 67,
        h: 110,
        category: 'chair',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '5a263c94d2fcd512544593d850e8ecc2'
      },
      {
        x: 55,
        y: 27,
        w: 154,
        h: 404,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '427f8f029ed697d0350828073d248702'
      },
      {
        x: 88,
        y: 242,
        w: 73,
        h: 137,
        category: 'tennis racket',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'a669f6d87548e45c0a41b07445780bfc'
      },
      {
        x: 538,
        y: 18,
        w: 58,
        h: 47,
        category: 'chair',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '6bf09016b5bdd692833f062649913031'
      },
      {
        x: 320,
        y: 271,
        w: 22,
        h: 20,
        category: 'sports ball',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '6cc7f27c9bed5cb9f78ed0f2bada7b00'
      },
      {
        x: 74,
        y: 12,
        w: 59,
        h: 44,
        category: 'chair',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '784ad4ef48bdcaee30ce77b50014db4e'
      },
      {
        x: 1,
        y: 9,
        w: 638,
        h: 288,
        category: 'chair',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '3f5e5d2aea190ffe4fe897340aabd32d'
      }
    ],
    name: '000000019432.jpg',
    idxInPage: 35,
    selected: false,
    blobSrc: 'blob:http://localhost/545fd6ab-2527-4c55-a235-1a12c0fdde10'
  },
  {
    id: 37,
    file_name: '000000019742.jpg',
    file_size: 91344,
    image_width: 500,
    image_height: 374,
    image_area: 187000,
    upload_time: '2021-11-10T10:28:45+00:00',
    annotations: [
      {
        x: 172,
        y: 72,
        w: 166,
        h: 275,
        category: 'vase',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'fc87c0d1818fc8222c1dc73a37592496'
      }
    ],
    name: '000000019742.jpg',
    idxInPage: 36,
    selected: false,
    blobSrc: 'blob:http://localhost/79caf440-cb3d-4485-bff0-a4233af2d5ea'
  },
  {
    id: 38,
    file_name: '000000019786.jpg',
    file_size: 79278,
    image_width: 500,
    image_height: 375,
    image_area: 187500,
    upload_time: '2021-11-10T10:28:45+00:00',
    annotations: [
      {
        x: 71,
        y: 59,
        w: 254,
        h: 259,
        category: 'couch',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '7697d011acb9b680ac60ec132f3e73fa'
      },
      {
        x: 166,
        y: 1,
        w: 137,
        h: 369,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '6909b4a4a99ae9bc149e0563f4dc24e8'
      },
      {
        x: 250,
        y: 16,
        w: 229,
        h: 356,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '826bb9562391b2e2b38ffd54ea07bf16'
      },
      {
        x: 444,
        y: 87,
        w: 40,
        h: 45,
        category: 'laptop',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '69b34b9a627ef6de6f599ab91299d5d7'
      },
      {
        x: 296,
        y: 345,
        w: 15,
        h: 22,
        category: 'remote',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '3cdacb5f6fce8c89bebd1d081cf383aa'
      },
      {
        x: 254,
        y: 73,
        w: 9,
        h: 19,
        category: 'remote',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'ac5ea44ee0f2c36d1a9f039c9e0d8034'
      }
    ],
    name: '000000019786.jpg',
    idxInPage: 37,
    selected: false,
    blobSrc: 'blob:http://localhost/70d1d9ff-a120-478d-95ec-c98c984199b0'
  },
  {
    id: 39,
    file_name: '000000020059.jpg',
    file_size: 210318,
    image_width: 640,
    image_height: 427,
    image_area: 273280,
    upload_time: '2021-11-10T10:28:45+00:00',
    annotations: [
      {
        x: 110,
        y: 200,
        w: 108,
        h: 107,
        category: 'zebra',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '2007bd9b0f72343ef954e9edb5cb0229'
      },
      {
        x: 341,
        y: 185,
        w: 165,
        h: 115,
        category: 'zebra',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'fe215005913f5b54279c55daaeb0fdcc'
      }
    ],
    name: '000000020059.jpg',
    idxInPage: 38,
    selected: false,
    blobSrc: 'blob:http://localhost/824a7650-f22c-4009-b178-e0630a287f86'
  },
  {
    id: 40,
    file_name: '000000020107.jpg',
    file_size: 106821,
    image_width: 333,
    image_height: 500,
    image_area: 166500,
    upload_time: '2021-11-10T10:28:45+00:00',
    annotations: [
      {
        x: 121,
        y: 87,
        w: 212,
        h: 407,
        category: 'fire hydrant',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '6381baa9ca44da8677dfdf58c7e8fd66'
      }
    ],
    name: '000000020107.jpg',
    idxInPage: 39,
    selected: false,
    blobSrc: 'blob:http://localhost/4ad05384-7e28-464f-8dc0-7855631a5676'
  },
  {
    id: 41,
    file_name: '000000021839.jpg',
    file_size: 219015,
    image_width: 480,
    image_height: 640,
    image_area: 307200,
    upload_time: '2021-11-10T10:28:45+00:00',
    annotations: [
      {
        x: 261,
        y: 204,
        w: 21,
        h: 59,
        category: 'traffic light',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '0a7f4f37af3cfd72d22a3ca1dbd0998b'
      },
      {
        x: 211,
        y: 393,
        w: 66,
        h: 185,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '9fe429fdc9bd078d89c8a6a6d4952c5b'
      },
      {
        x: 410,
        y: 462,
        w: 26,
        h: 60,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '34d31775a75b74fe82d1985fd7c64624'
      },
      {
        x: 432,
        y: 457,
        w: 25,
        h: 69,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'c7cf7432b930b96fcf280cb35af0b576'
      },
      {
        x: 169,
        y: 457,
        w: 14,
        h: 48,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'c459eb48268e54e14ff081fa43ab9bcf'
      },
      {
        x: 47,
        y: 449,
        w: 13,
        h: 48,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'b66691097e29d1ecc1f888a0a56e4139'
      },
      {
        x: 467,
        y: 471,
        w: 11,
        h: 38,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '7a919ada92482183c01df510cf6f4d69'
      },
      {
        x: 218,
        y: 440,
        w: 28,
        h: 31,
        category: 'handbag',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '9fac49e6bc0e243a82ee3f5d0d6030bc'
      },
      {
        x: 448,
        y: 468,
        w: 9,
        h: 29,
        category: 'handbag',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '36d273a9f639a6a547765fed9e7a96ea'
      },
      {
        x: 425,
        y: 472,
        w: 9,
        h: 25,
        category: 'handbag',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'bf7abbe0e19884805c9b3150c00ba236'
      },
      {
        x: 429,
        y: 492,
        w: 10,
        h: 15,
        category: 'handbag',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'c9a76511e88fd03e55018d171e78cb7f'
      },
      {
        x: 25,
        y: 454,
        w: 24,
        h: 44,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '9def9dbb0f352a4b8314fdc4a9ad7029'
      },
      {
        x: 59,
        y: 457,
        w: 9,
        h: 26,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '2418a6a8b112e4b917cf0bda1dd4080d'
      },
      {
        x: 0,
        y: 456,
        w: 32,
        h: 62,
        category: 'car',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'eaa1b8d634e4c30ed0d51c9c2c0ac91e'
      },
      {
        x: 451,
        y: 473,
        w: 10,
        h: 53,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '834ed462fb1848f6affe0d0e3e950d08'
      }
    ],
    name: '000000021839.jpg',
    idxInPage: 40,
    selected: false,
    blobSrc: 'blob:http://localhost/90a75b2a-3219-41a7-bb37-6620df309d7e'
  },
  {
    id: 42,
    file_name: '000000022705.jpg',
    file_size: 102437,
    image_width: 482,
    image_height: 640,
    image_area: 308480,
    upload_time: '2021-11-10T10:28:45+00:00',
    annotations: [
      {
        x: 82,
        y: 213,
        w: 24,
        h: 66,
        category: 'bottle',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '0048dd453b5e81e9d2e4ae68daca34d0'
      },
      {
        x: 137,
        y: 48,
        w: 256,
        h: 499,
        category: 'refrigerator',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '373db342ca62d15d870da68a954807ca'
      },
      {
        x: 144,
        y: 83,
        w: 220,
        h: 525,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '2f952c12aeedc6ad15076b974a1f45cc'
      },
      {
        x: 179,
        y: 211,
        w: 25,
        h: 82,
        category: 'wine glass',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'a6c3e9dc4cbe7bd7c680ee55eefed58b'
      },
      {
        x: 23,
        y: 257,
        w: 32,
        h: 24,
        category: 'bowl',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '98c80f6e7ccc1a5f313b6f222c1b2633'
      }
    ],
    name: '000000022705.jpg',
    idxInPage: 41,
    selected: false,
    blobSrc: 'blob:http://localhost/a9fec5b2-da6c-44bd-a3fc-313ec5c4e85b'
  },
  {
    id: 43,
    file_name: '000000022935.jpg',
    file_size: 143625,
    image_width: 640,
    image_height: 480,
    image_area: 307200,
    upload_time: '2021-11-10T10:28:45+00:00',
    annotations: [
      {
        x: 49,
        y: 195,
        w: 139,
        h: 139,
        category: 'sports ball',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '00f1c4a14442247d6a34cd310505fe92'
      },
      {
        x: 20,
        y: 18,
        w: 437,
        h: 455,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'ddfb598668dc421a562ea72059c3df57'
      },
      {
        x: 423,
        y: 26,
        w: 211,
        h: 449,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'e8b8dbbe8455c90d1ce87152c6ca9517'
      }
    ],
    name: '000000022935.jpg',
    idxInPage: 42,
    selected: false,
    blobSrc: 'blob:http://localhost/276a199f-df68-46c5-b136-6c45c92da139'
  },
  {
    id: 44,
    file_name: '000000023023.jpg',
    file_size: 125535,
    image_width: 612,
    image_height: 612,
    image_area: 374544,
    upload_time: '2021-11-10T10:28:45+00:00',
    annotations: [
      {
        x: 407,
        y: 232,
        w: 168,
        h: 181,
        category: 'handbag',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'd8be00272792a6ac4928db1e4740f122'
      },
      {
        x: 206,
        y: 166,
        w: 204,
        h: 259,
        category: 'suitcase',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '87f65b88ef7828ee313f2a6166a0d137'
      }
    ],
    name: '000000023023.jpg',
    idxInPage: 43,
    selected: false,
    blobSrc: 'blob:http://localhost/5772bf20-866a-40c9-b624-092108764134'
  },
  {
    id: 45,
    file_name: '000000023034.jpg',
    file_size: 250952,
    image_width: 640,
    image_height: 427,
    image_area: 273280,
    upload_time: '2021-11-10T10:28:45+00:00',
    annotations: [
      {
        x: 253,
        y: 214,
        w: 49,
        h: 130,
        category: 'horse',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '6541b70759e7e30137ad1d6a10b28e69'
      },
      {
        x: 420,
        y: 0,
        w: 220,
        h: 422,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '1ad779cccf62ca339b35251deebf693a'
      },
      {
        x: 233,
        y: 147,
        w: 86,
        h: 120,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'dd28c61c0e23432715b97b8e160540cb'
      },
      {
        x: 299,
        y: 182,
        w: 76,
        h: 95,
        category: 'horse',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '9a9d211a0f4ace70099f5bceeb96a4a2'
      },
      {
        x: 519,
        y: 138,
        w: 121,
        h: 169,
        category: 'backpack',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '84c3f643aacfe11df39ecd42d5f0a9a1'
      }
    ],
    name: '000000023034.jpg',
    idxInPage: 44,
    selected: false,
    blobSrc: 'blob:http://localhost/9327eb47-1eaf-4a81-a8b8-e6c73726ec6c'
  },
  {
    id: 46,
    file_name: '000000023230.jpg',
    file_size: 374702,
    image_width: 640,
    image_height: 480,
    image_area: 307200,
    upload_time: '2021-11-10T10:28:45+00:00',
    annotations: [
      {
        x: 312,
        y: 254,
        w: 52,
        h: 23,
        category: 'bird',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '01da5e380de5d32806e9137b59f5845b'
      },
      {
        x: 360,
        y: 248,
        w: 54,
        h: 28,
        category: 'bird',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '2160ed641f7a79980bb9cd0aa63d1740'
      },
      {
        x: 104,
        y: 216,
        w: 44,
        h: 21,
        category: 'bird',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '853d993e54c00b9961585551389e6e45'
      },
      {
        x: 4,
        y: 234,
        w: 33,
        h: 9,
        category: 'bird',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '7a0ac561ebbd11c99d81608df913bb12'
      }
    ],
    name: '000000023230.jpg',
    idxInPage: 45,
    selected: false,
    blobSrc: 'blob:http://localhost/1110d342-7af3-46c8-84d2-cfb4735bcdc5'
  },
  {
    id: 47,
    file_name: '000000023751.jpg',
    file_size: 142197,
    image_width: 430,
    image_height: 640,
    image_area: 275200,
    upload_time: '2021-11-10T10:28:45+00:00',
    annotations: [
      {
        x: 188,
        y: 112,
        w: 102,
        h: 73,
        category: 'kite',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '0ef90c0d1d2e9adbe3502e7d5fe7bc89'
      }
    ],
    name: '000000023751.jpg',
    idxInPage: 46,
    selected: false,
    blobSrc: 'blob:http://localhost/2b910e3a-c85b-42e3-887e-88a8d2574f61'
  },
  {
    id: 48,
    file_name: '000000024567.jpg',
    file_size: 243476,
    image_width: 480,
    image_height: 640,
    image_area: 307200,
    upload_time: '2021-11-10T10:28:45+00:00',
    annotations: [
      {
        x: 352,
        y: 306,
        w: 127,
        h: 281,
        category: 'chair',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'f6a0d3c80423ba834981fc6f492c2122'
      },
      {
        x: 0,
        y: 0,
        w: 421,
        h: 477,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '0e6e6b4fda6f784f33847e7fd9e56097'
      },
      {
        x: 44,
        y: 381,
        w: 81,
        h: 127,
        category: 'hot dog',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '7524a7673961fe9761859dad653fdc4a'
      },
      {
        x: 121,
        y: 386,
        w: 145,
        h: 87,
        category: 'hot dog',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '28b618a3abf8b4b793656741b9b149ea'
      },
      {
        x: 187,
        y: 437,
        w: 176,
        h: 111,
        category: 'hot dog',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'd02f51c987498c9eddfe9a53c05c5fd1'
      },
      {
        x: 51,
        y: 468,
        w: 151,
        h: 107,
        category: 'hot dog',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '6a9b9dd3d9c57a44c15aa41405be1e46'
      },
      {
        x: 138,
        y: 528,
        w: 169,
        h: 55,
        category: 'hot dog',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'a5d3eff58814235b8f3e2cd9b9b88fc2'
      },
      {
        x: 284,
        y: 523,
        w: 130,
        h: 117,
        category: 'hot dog',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'f5077b0de2da512f2575026c673d9e1f'
      },
      {
        x: 101,
        y: 583,
        w: 193,
        h: 57,
        category: 'hot dog',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '5c085eb19ec900f5b7a2fe2124fb1414'
      }
    ],
    name: '000000024567.jpg',
    idxInPage: 47,
    selected: false,
    blobSrc: 'blob:http://localhost/226c3cfe-dc41-4785-a86f-2e26551f4f91'
  },
  {
    id: 49,
    file_name: '000000024610.jpg',
    file_size: 98318,
    image_width: 640,
    image_height: 480,
    image_area: 307200,
    upload_time: '2021-11-10T10:28:45+00:00',
    annotations: [
      {
        x: 67,
        y: 284,
        w: 154,
        h: 196,
        category: 'chair',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '8ea93947b5a96a489510a602c783255e'
      },
      {
        x: 456,
        y: 302,
        w: 184,
        h: 171,
        category: 'couch',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '66ed49bc5d30f16484922f14dcbf077c'
      },
      {
        x: 24,
        y: 247,
        w: 121,
        h: 74,
        category: 'laptop',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '273246543c9cf9e7f9567a456b70804e'
      },
      {
        x: 328,
        y: 321,
        w: 97,
        h: 41,
        category: 'book',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '37cbfe2221e09eda901f001bc423ec3f'
      },
      {
        x: 378,
        y: 381,
        w: 11,
        h: 43,
        category: 'book',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '51d583702746612540f9ffb0df6d4f46'
      },
      {
        x: 329,
        y: 368,
        w: 95,
        h: 56,
        category: 'book',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '4bd68eb8192e43b18cc514e3fa9e78e8'
      },
      {
        x: 267,
        y: 327,
        w: 21,
        h: 44,
        category: 'book',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '3f67aa88dd755ff4dd8dcd2ffa659676'
      },
      {
        x: 312,
        y: 330,
        w: 14,
        h: 43,
        category: 'book',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '2f6b8de3831a3e157e0080c61a729d66'
      },
      {
        x: 228,
        y: 323,
        w: 12,
        h: 52,
        category: 'book',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '9fb62e2e796a5157793d6e1d655a8d86'
      },
      {
        x: 248,
        y: 330,
        w: 4,
        h: 41,
        category: 'book',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'e3944d2729c5a08dd68806d06292b3ef'
      },
      {
        x: 278,
        y: 406,
        w: 47,
        h: 15,
        category: 'book',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '8235bed81f81c33c23e7a27225725562'
      },
      {
        x: 520,
        y: 302,
        w: 89,
        h: 102,
        category: 'backpack',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'e3087a9837d0d0e10982d739e1839330'
      },
      {
        x: 12,
        y: 261,
        w: 23,
        h: 66,
        category: 'bottle',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '5a51717de9f85fbccc3e1a98f11332b8'
      },
      {
        x: 4,
        y: 387,
        w: 11,
        h: 34,
        category: 'chair',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '61002ead19a3af9809c0197446404dab'
      },
      {
        x: 0,
        y: 386,
        w: 3,
        h: 39,
        category: 'chair',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'c37d80033ca86249c4af490dcbdbe4df'
      },
      {
        x: 0,
        y: 323,
        w: 59,
        h: 26,
        category: 'book',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '320bc0e417cabb52b38d3165c324c476'
      }
    ],
    name: '000000024610.jpg',
    idxInPage: 48,
    selected: false,
    blobSrc: 'blob:http://localhost/7a775ed0-0395-46e3-bf3a-db72b61498c0'
  },
  {
    id: 50,
    file_name: '000000025057.jpg',
    file_size: 181800,
    image_width: 640,
    image_height: 427,
    image_area: 273280,
    upload_time: '2021-11-10T10:28:45+00:00',
    annotations: [
      {
        x: 410,
        y: 111,
        w: 16,
        h: 49,
        category: 'bottle',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '7cf4dd3aaa8b563bb57b876c16da46ca'
      },
      {
        x: 332,
        y: 129,
        w: 90,
        h: 75,
        category: 'frisbee',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'ab298c8cff25f405981dd781a6311a07'
      },
      {
        x: 97,
        y: 244,
        w: 46,
        h: 81,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '286d88fd9dc3511dadcdaddedb229c67'
      },
      {
        x: 128,
        y: 6,
        w: 301,
        h: 416,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '380b2f584fb62389eb410566eba53654'
      }
    ],
    name: '000000025057.jpg',
    idxInPage: 49,
    selected: false,
    blobSrc: 'blob:http://localhost/780ab314-d5e1-4093-ab02-fcec54770bf1'
  },
  {
    id: 51,
    file_name: '000000025096.jpg',
    file_size: 123934,
    image_width: 375,
    image_height: 500,
    image_area: 187500,
    upload_time: '2021-11-10T10:28:45+00:00',
    annotations: [
      {
        x: 1,
        y: 37,
        w: 211,
        h: 291,
        category: 'person',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '9eaecfe8d0757ecf763e874c2cffc338'
      },
      {
        x: 39,
        y: 311,
        w: 105,
        h: 75,
        category: 'knife',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '750c17f6fdca353b5a242958ff4f0eb9'
      },
      {
        x: 224,
        y: 471,
        w: 50,
        h: 29,
        category: 'zebra',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'dba43fb73a379b35274e9e5d88d71ba9'
      },
      {
        x: 101,
        y: 277,
        w: 225,
        h: 132,
        category: 'skateboard',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: 'ac7a58fe3c8f0ade23b7416f65807a21'
      },
      {
        x: 0,
        y: 213,
        w: 33,
        h: 39,
        category: 'chair',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '9888b558c2fc49666689fdfa6054f5e4'
      },
      {
        x: 0,
        y: 233,
        w: 375,
        h: 267,
        category: 'dining table',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '48ce9c281952ea9265c531525b00ff2e'
      }
    ],
    name: '000000025096.jpg',
    idxInPage: 50,
    selected: false,
    blobSrc: 'blob:http://localhost/24c07eb7-6daa-4a93-ba65-fab49250a3c1'
  }
]

const projectMock = {
  title: 'tests',
  description: 'test',
  creator: '550081106',
  creator_username: 'user-324482037',
  created_at: '2021-11-10T03:30:20+00:00',
  type: 'detection',
  hash: 'd8b0c855758d47e2b1baee4673b2193a',
  slug: 'tests',
  categories: [
    'dog',
    'potted plant',
    'tv',
    'bird',
    'cat',
    'horse',
    'sheep',
    'cow',
    'bottle',
    'couch',
    'chair',
    'dining table',
    'bicycle',
    'car',
    'motorcycle',
    'airplane',
    'bus',
    'train',
    'boat',
    'person',
    'stop sign',
    'umbrella',
    'tie',
    'sandwich',
    'bed',
    'cell phone',
    'refrigerator',
    'clock',
    'toothbrush',
    'truck',
    'traffic light',
    'fire hydrant',
    'parking meter',
    'bench',
    'frisbee',
    'skis',
    'snowboard',
    'skateboard',
    'surfboard',
    'wine glass',
    'cup',
    'fork',
    'knife',
    'spoon',
    'bowl',
    'banana',
    'apple',
    'orange',
    'broccoli',
    'carrot',
    'pizza',
    'cake',
    'toilet',
    'laptop',
    'mouse',
    'remote',
    'keyboard',
    'microwave',
    'oven',
    'toaster',
    'sink',
    'book',
    'vase',
    'scissors',
    'teddy bear',
    'hair drier',
    'backpack',
    'handbag',
    'suitcase',
    'elephant',
    'zebra',
    'kite',
    'hot dog',
    'donut',
    'giraffe',
    'baseball bat',
    'baseball glove',
    'sports ball',
    'bear',
    'tennis racket',
    'humans'
  ],
  num_images: 0,
  images_version_committed: false,
  annotations_version_committed: false,
  colors: {
    dog: 'rgba(57, 239, 112, 0.75)',
    'potted plant': 'rgba(148, 87, 191, 0.75)',
    tv: 'rgba(229, 252, 126, 0.75)',
    bird: 'rgba(21, 204, 237, 0.75)',
    cat: 'rgba(211, 141, 61, 0.75)',
    horse: 'rgba(226, 145, 138, 0.75)',
    sheep: 'rgba(221, 152, 24, 0.75)',
    cow: 'rgba(156, 242, 142, 0.75)',
    bottle: 'rgba(236, 58, 242, 0.75)',
    couch: 'rgba(130, 239, 127, 0.75)',
    chair: 'rgba(41, 82, 147, 0.75)',
    'dining table': 'rgba(113, 252, 194, 0.75)',
    bicycle: 'rgba(99, 45, 198, 0.75)',
    car: 'rgba(42, 249, 173, 0.75)',
    motorcycle: 'rgba(14, 99, 135, 0.75)',
    airplane: 'rgba(204, 191, 14, 0.75)',
    bus: 'rgba(57, 239, 112, 0.75)',
    train: 'rgba(148, 87, 191, 0.75)',
    boat: 'rgba(229, 252, 126, 0.75)',
    person: 'rgba(21, 204, 237, 0.75)',
    'stop sign': 'rgba(211, 141, 61, 0.75)',
    umbrella: 'rgba(226, 145, 138, 0.75)',
    tie: 'rgba(221, 152, 24, 0.75)',
    sandwich: 'rgba(156, 242, 142, 0.75)',
    bed: 'rgba(236, 58, 242, 0.75)',
    'cell phone': 'rgba(130, 239, 127, 0.75)',
    refrigerator: 'rgba(41, 82, 147, 0.75)',
    clock: 'rgba(113, 252, 194, 0.75)',
    toothbrush: 'rgba(99, 45, 198, 0.75)',
    truck: 'rgba(42, 249, 173, 0.75)',
    'traffic light': 'rgba(14, 99, 135, 0.75)',
    'fire hydrant': 'rgba(204, 191, 14, 0.75)',
    'parking meter': 'rgba(57, 239, 112, 0.75)',
    bench: 'rgba(148, 87, 191, 0.75)',
    frisbee: 'rgba(229, 252, 126, 0.75)',
    skis: 'rgba(21, 204, 237, 0.75)',
    snowboard: 'rgba(211, 141, 61, 0.75)',
    skateboard: 'rgba(226, 145, 138, 0.75)',
    surfboard: 'rgba(221, 152, 24, 0.75)',
    'wine glass': 'rgba(156, 242, 142, 0.75)',
    cup: 'rgba(236, 58, 242, 0.75)',
    fork: 'rgba(130, 239, 127, 0.75)',
    knife: 'rgba(41, 82, 147, 0.75)',
    spoon: 'rgba(113, 252, 194, 0.75)',
    bowl: 'rgba(99, 45, 198, 0.75)',
    banana: 'rgba(42, 249, 173, 0.75)',
    apple: 'rgba(14, 99, 135, 0.75)',
    orange: 'rgba(204, 191, 14, 0.75)',
    broccoli: 'rgba(57, 239, 112, 0.75)',
    carrot: 'rgba(148, 87, 191, 0.75)',
    pizza: 'rgba(229, 252, 126, 0.75)',
    cake: 'rgba(21, 204, 237, 0.75)',
    toilet: 'rgba(211, 141, 61, 0.75)',
    laptop: 'rgba(226, 145, 138, 0.75)',
    mouse: 'rgba(221, 152, 24, 0.75)',
    remote: 'rgba(156, 242, 142, 0.75)',
    keyboard: 'rgba(236, 58, 242, 0.75)',
    microwave: 'rgba(130, 239, 127, 0.75)',
    oven: 'rgba(41, 82, 147, 0.75)',
    toaster: 'rgba(113, 252, 194, 0.75)',
    sink: 'rgba(99, 45, 198, 0.75)',
    book: 'rgba(42, 249, 173, 0.75)',
    vase: 'rgba(14, 99, 135, 0.75)',
    scissors: 'rgba(204, 191, 14, 0.75)',
    'teddy bear': 'rgba(57, 239, 112, 0.75)',
    'hair drier': 'rgba(148, 87, 191, 0.75)',
    backpack: 'rgba(229, 252, 126, 0.75)',
    handbag: 'rgba(21, 204, 237, 0.75)',
    suitcase: 'rgba(211, 141, 61, 0.75)',
    elephant: 'rgba(226, 145, 138, 0.75)',
    zebra: 'rgba(221, 152, 24, 0.75)',
    kite: 'rgba(156, 242, 142, 0.75)',
    'hot dog': 'rgba(236, 58, 242, 0.75)',
    donut: 'rgba(130, 239, 127, 0.75)',
    giraffe: 'rgba(41, 82, 147, 0.75)',
    'baseball bat': 'rgba(113, 252, 194, 0.75)',
    'baseball glove': 'rgba(99, 45, 198, 0.75)',
    'sports ball': 'rgba(42, 249, 173, 0.75)',
    bear: 'rgba(14, 99, 135, 0.75)',
    'tennis racket': 'rgba(204, 191, 14, 0.75)',
    humans: 'rgba(57, 239, 112, 0.75)',
    _catX: 'rgba(255,255,255,0.4)'
  }
}

const canvasCtxMock = {
  annotationsVisible: false,
  isDrawing: false,
  imageOI: {
    id: 24,
    file_name: '000000015746.jpg',
    file_size: 196039,
    image_width: 427,
    image_height: 640,
    image_area: 273280,
    upload_time: '2021-11-10T10:28:44+00:00',
    annotations: [
      {
        x: 72,
        y: 198,
        w: 279,
        h: 378,
        category: 'fire hydrant',
        timestamp_z: '2021-11-12T22:04:03',
        unique_hash_z: '241e823d6867aca577c3d7f72c5bd3db',
        text_id: 0
      }
    ],
    name: '000000015746.jpg',
    idxInPage: 23,
    selected: false,
    blobSrc:
      'data:image/jpeg;base64,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'
  },
  cateOI: null,
  objectOI: null
}

type canvasStateType = {
  x: number
  y: number
  w: number
  h: number
  category: string
  unique_hash_z: string
  text_id: string
  timestamp_z: string
}[]

// enum CoordsType {
//   CANVAS = 'CANVAS',
//   IMG = 'IMG'
// }

// interface ImageObject

export const ImageAnnotater = () => {
  // ref
  const imgElRef = useRef(null)
  const canvasElRef = useRef(null)
  const canvasRef = useRef<fabric.Canvas | null>(null)
  const stateStackRef = useRef<canvasStateType[]>([])
  const ptrInStackRef = useRef(0)

  const xoffset = useRef<number>(0)
  const yoffset = useRef<number>(0)
  const xscale = useRef<number>(1)
  const yscale = useRef<number>(1)

  // for zoom/pan/drag
  // const isPanning = useRef(false)
  // const lastPosX = useRef(0)
  // const lastPosY = useRef(0)
  // const pinchGesture = useRef<PinchGesture | null>(null)

  // context
  const [canvasCtx] = useState(canvasCtxMock)
  const isDrawingRef = useRef(false)
  isDrawingRef.current = canvasCtx.isDrawing

  // state
  const [showCateEditBar, setShowCateEditBar] = useState(false)
  const [showCateListBar, setShowCateListBar] = useState(false)
  const [cateCandid, setCateCandid] = useState<string>('')
  const [selBarFoldingState, setSelBarFoldingState] = useState(0)
  const cycleSelBarFoldingState = () => {
    setSelBarFoldingState((selBarFoldingState + 1) % 4)
  }

  const [canUndo] = useState(false)
  const [canRedo] = useState(false)
  const [canReset] = useState(false)

  const abbr = (s: string, n: number) =>
    s.slice(0, n) + (s.length > n ? '...' : '')

  const { categories, colors } = projectMock

  const newCategoryName = '_catX'
  colors[newCategoryName] = 'rgba(255,255,255,0.4)'

  interface groupedAnnotationsType {
    [key: string]: any
  }
  const groupedAnnotations: groupedAnnotationsType = imgObj.annotations
    ? imgObj.annotations.reduce((ret: any, anno: any) => {
        ret[anno.category]
          ? ret[anno.category].push(anno)
          : (ret[anno.category] = [anno])
        return ret
      }, {})
    : {}

  const onImgLoad = () => {
    const img: any = imgElRef.current

    const cw = img.getBoundingClientRect().width
    const ch = img.getBoundingClientRect().height

    const divCanvasExtended = document.getElementById('canvas_extended')
    const cew = (divCanvasExtended as HTMLElement).getBoundingClientRect().width

    const ceh =
      (divCanvasExtended as HTMLElement).getBoundingClientRect().height - 36

    const e_offset_x = (cew - cw) / 2
    const e_offset_y = (ceh - ch) / 2

    // initialize stacks
    stateStackRef.current = []
    ptrInStackRef.current = 0

    // initialize xoffset & scale
    xoffset.current = e_offset_x
    yoffset.current = e_offset_y
    xscale.current = cw / imgObj.image_width
    yscale.current = ch / imgObj.image_height

    if (canvasRef.current === null) {
      // clear category selection information when clicking an image from workspace landing page
      // canvasCtxDispatch({
      //   type: 'setCateOI',
      //   payload: null
      // })

      canvasRef.current = new fabric.Canvas(canvasElRef.current, {
        defaultCursor: 'default',
        selection: false,
        targetFindTolerance: 5,
        uniformScaling: false
      })

      const canvas = canvasRef.current
      canvas.setWidth(cew)
      canvas.setHeight(ceh)

      const lowerCanvasEl = canvas.getElement()

      const canvasContainerEl = lowerCanvasEl.parentElement as HTMLElement
      canvasContainerEl.style.position = 'absolute'
      canvasContainerEl.style.top = '0'
      canvasContainerEl.classList.add('bg-gray-200')
      canvasContainerEl.style.touchAction = 'none'

      lowerCanvasEl.classList.remove('hidden')
      const upperCanvasEl = lowerCanvasEl.nextElementSibling as Element
      upperCanvasEl.classList.remove('hidden')
    }

    // clear box selection information from last image, but keep category selection information
    // canvasCtxDispatch({
    //   type: 'clearObjectOI'
    // })

    // reset isDrawing mode
    // canvasCtxDispatch({
    //   type: 'setIsDrawing',
    //   payload: false
    // })

    // close CateEditBar
    setShowCateEditBar(false)

    const canvas = canvasRef.current
    canvas.clear()
    canvas.setWidth(cew)
    canvas.setHeight(ceh)
    canvas.setViewportTransform([1, 0, 0, 1, 0, 0])

    canvas.add(
      new fabric.Image(img, {
        left: e_offset_x,
        top: e_offset_y,
        scaleX: cw / imgObj.image_width,
        scaleY: ch / imgObj.image_height,
        hasBorders: false,
        hasControls: false,
        selectable: false,
        hoverCursor: 'default'
      })
    )

    if (imgObj.annotations !== null) {
      // keep context as category filtering during image opening/switching
      // so we can quickly browse one specific category objects on all images
      // drawObjectsFromState(imgObj.annotations, CoordsType.IMG, true)
    }

    canvas.renderAll()
    canvas.zoomToPoint(new fabric.Point(cew / 2, ceh / 2), 1)
    // cSave()

    // remove old eventHandler
    canvas.off('mouse:wheel')
    // update eventHandler
    canvas.on('mouse:wheel', (o) => {
      const evt = o.e as any as React.WheelEvent
      const delta = evt.deltaY
      let zoom = canvas.getZoom()
      zoom *= 0.999 ** delta
      if (zoom > 20) zoom = 20
      if (zoom < 0.01) zoom = 0.01
      canvas.zoomToPoint(
        new fabric.Point((evt as any).offsetX, (evt as any).offsetY),
        zoom
      )
      evt.preventDefault()
      evt.stopPropagation()

      const vpt: any = canvas.viewportTransform
      if (zoom < 1) {
        vpt[4] = (cew * (1 - zoom)) / 2
        vpt[5] = (ceh * (1 - zoom)) / 2
      } else {
        if (vpt[4] >= 0) {
          vpt[4] = 0
        } else if (vpt[4] < cew * (1 - zoom)) {
          vpt[4] = cew * (1 - zoom)
        }
        if (vpt[5] >= 0) {
          vpt[5] = 0
        } else if (vpt[5] < ceh * (1 - zoom)) {
          vpt[5] = ceh * (1 - zoom)
        }
      }
    })

    canvas.off('mouse:down')
    // canvas.on('mouse:down', (o) => {
    //   if (isDrawingRef.current) {
    //     drawStartFromCursor(o)
    //   } else {
    //     const evt = o.e as any as React.MouseEvent | React.TouchEvent

    //     let clientX // screen/page coordinates
    //     let clientY // screen/page coordinates

    //     if (isTouchEvt(evt)) {
    //       clientX = evt.touches[0].clientX
    //       clientY = evt.touches[0].clientY
    //     } else {
    //       clientX = evt.clientX
    //       clientY = evt.clientY
    //     }

    //     const selObj = canvas.getActiveObject()

    //     lastPosX.current = clientX
    //     lastPosY.current = clientY

    //     isPanning.current = selObj === null || selObj === undefined

    //     if (selObj)
    //       canvasCtxDispatch({
    //         type: 'setObjectOI',
    //         payload: {
    //           category: (selObj as any).category,
    //           unique_hash_z: (selObj as any).unique_hash_z
    //         }
    //       })
    //     else
    //       canvasCtxDispatch({
    //         type: 'setCateOI',
    //         payload: null
    //       })
    //   }
    // })

    canvas.off('mouse:move')
    // canvas.on('mouse:move', (o) => {
    //   if (isDrawingRef.current && drawingStarted.current) {
    //     const pointer = canvas.getPointer(o.e)

    //     const obj = onDrawObj.current as fabric.Object
    //     const origX = originX.current
    //     const origY = originY.current

    //     const left =
    //       Math.min(
    //         Math.max(e_offset_x, origX > pointer.x ? pointer.x : origX),
    //         e_offset_x + cw
    //       ) - strokeWidth
    //     const right = Math.max(
    //       Math.min(e_offset_x + cw, origX > pointer.x ? origX : pointer.x),
    //       e_offset_x
    //     )
    //     const top =
    //       Math.min(
    //         Math.max(e_offset_y, origY > pointer.y ? pointer.y : origY),
    //         e_offset_y + ch
    //       ) - strokeWidth
    //     const bottom = Math.max(
    //       Math.min(e_offset_y + ch, origY > pointer.y ? origY : pointer.y),
    //       e_offset_y
    //     )

    //     obj.set({
    //       left: left,
    //       top: top,
    //       width: right - left,
    //       height: bottom - top
    //     })

    //     canvas.requestRenderAll()
    //   }

    //   if (isPanning.current) {
    //     const evt = o.e as any as React.MouseEvent | React.TouchEvent

    //     let clientX
    //     let clientY

    //     if (isTouchEvt(evt)) {
    //       clientX = evt.touches[0].clientX
    //       clientY = evt.touches[0].clientY
    //     } else {
    //       clientX = evt.clientX
    //       clientY = evt.clientY
    //     }

    //     const zoom = canvas.getZoom()
    //     const vpt = canvas.viewportTransform as number[]
    //     if (zoom < 1) {
    //       vpt[4] = (cew * (1 - zoom)) / 2
    //       vpt[5] = (ceh * (1 - zoom)) / 2
    //     } else {
    //       vpt[4] += clientX - lastPosX.current
    //       vpt[5] += clientY - lastPosY.current
    //       if (vpt[4] >= 0) {
    //         vpt[4] = 0
    //       } else if (vpt[4] < cew * (1 - zoom)) {
    //         vpt[4] = cew * (1 - zoom)
    //       }
    //       if (vpt[5] >= 0) {
    //         vpt[5] = 0
    //       } else if (vpt[5] < ceh * (1 - zoom)) {
    //         vpt[5] = ceh * (1 - zoom)
    //       }
    //     }

    //     canvas.requestRenderAll()
    //     lastPosX.current = clientX
    //     lastPosY.current = clientY
    //   }
    // })

    canvas.off('mouse:up')
    // canvas.on('mouse:up', () => {
    //   if (isDrawingRef.current) {
    //     drawEndAtCursor()
    //   }

    //   // on mouse up we want to recalculate new interaction
    //   // for all objects, so we call setViewportTransform
    //   canvas.setViewportTransform(canvas.viewportTransform as number[])
    //   isPanning.current = false

    //   // update corresponding textBox position
    //   const selObj: any = canvas.getActiveObject()
    //   if (selObj) {
    //     const theTextBox = canvas._objects.filter((o: any) => {
    //       return (
    //         o.type === 'textbox' && o.unique_hash_z === selObj.unique_hash_z
    //       )
    //     })[0] as fabric.Textbox

    //     // selected object width/height dont get updated automatically
    //     const w = selObj.getScaledWidth() - selObj.strokeWidth
    //     const h = selObj.getScaledHeight() - selObj.strokeWidth

    //     const fs = Math.min(14, w / 2, h / 2)
    //     const ndigits = (theTextBox.text as string).length
    //     theTextBox.set({
    //       top: selObj.top,
    //       left: selObj.left + 1,
    //       fontSize: fs,
    //       width: (fs * ndigits) / 2
    //     })
    //   }
    // })

    canvas.off('object:modified')
    // canvas.on('object:modified', () => {
    //   cSave()
    // })

    // use-gestures for touch events
    // const lowerCanvasEl = canvas.getElement()
    // const canvasContainerEl = lowerCanvasEl.parentElement as HTMLElement

    // if (pinchGesture.current !== null) pinchGesture.current.destroy()
    // pinchGesture.current = new PinchGesture(
    //   canvasContainerEl,
    //   ({ offset: [scale] }) => {
    //     canvas.zoomToPoint(new fabric.Point(cew / 2, ceh / 2), scale)

    //     const vpt: any = canvas.viewportTransform
    //     if (scale < 1) {
    //       vpt[4] = (cew * (1 - scale)) / 2
    //       vpt[5] = (ceh * (1 - scale)) / 2
    //     } else {
    //       if (vpt[4] >= 0) {
    //         vpt[4] = 0
    //       } else if (vpt[4] < cew * (1 - scale)) {
    //         vpt[4] = cew * (1 - scale)
    //       }
    //       if (vpt[5] >= 0) {
    //         vpt[5] = 0
    //       } else if (vpt[5] < ceh * (1 - scale)) {
    //         vpt[5] = ceh * (1 - scale)
    //       }
    //     }
    //   },
    //   {
    //     scaleBounds: { min: 0.5, max: 10.0 }
    //   }
    // )
  }

  return (
    <div className='w-full h-full flex flex-col justify-center items-center relative'>
      <div
        className='h-full relative pb-7 md:pb-9 select-none w-full flex justify-center items-center overflow-y-hidden'
        id='canvas_extended'
      >
        <img
          alt={imgObj.name}
          title={imgObj.name}
          src={imgObj.blobSrc}
          loading='lazy'
          className='object-contain max-h-full invisible'
          onLoad={onImgLoad}
          ref={imgElRef}
        />
        <canvas ref={canvasElRef} className='hidden' />
      </div>

      <div className='absolute w-full h-full pb-7 md:pb-9 invisible'>
        <div
          className={`relative h-full p-2 overflow-hidden ${
            canvasCtx.annotationsVisible ? '' : 'hidden'
          }`}
        >
          <Draggable
            bounds='parent'
            handle='#cate_handle'
            cancel='.selbar-state-icon'
          >
            <div className='bg-gray-100 bg-opacity-0 absolute top-2 right-2 visible rounded-md max-h-full w-24 flex flex-col items-end text-xs shadow-lg select-none'>
              <div
                id='cate_handle'
                className='bg-indigo-400 py-2 px-2 w-full rounded-t-md flex justify-between'
              >
                {selBarFoldingState % 4 === 0 ? (
                  <MenuIcon
                    className='h-4 w-4 text-gray-700 selbar-state-icon'
                    onClick={cycleSelBarFoldingState}
                  />
                ) : selBarFoldingState % 4 === 1 ? (
                  <MenuAlt2Icon
                    className='h-4 w-4 text-gray-700 selbar-state-icon'
                    onClick={cycleSelBarFoldingState}
                  />
                ) : selBarFoldingState % 4 === 2 ? (
                  <MenuAlt3Icon
                    className='h-4 w-4 text-gray-700 selbar-state-icon'
                    onClick={cycleSelBarFoldingState}
                  />
                ) : (
                  <MenuAlt4Icon
                    className='h-4 w-4 text-gray-700 selbar-state-icon'
                    onClick={cycleSelBarFoldingState}
                  />
                )}
                category
              </div>
              <div
                className={`h-full w-full overflow-y-auto ${
                  selBarFoldingState === 3 ? 'hidden' : ''
                }`}
              >
                {Object.entries(groupedAnnotations).map(
                  ([cate, group], i_group) => (
                    <div
                      className={`px-2 flex flex-col items-end w-full py-1 rounded-lg ${
                        canvasCtx.cateOI === cate
                          ? 'border-l-6 border-indigo-600'
                          : ''
                      }`}
                      style={{ backgroundColor: colors[cate] }}
                      key={`group-${i_group}`}
                      // onClick={() => {
                      //   canvasCtxDispatch({
                      //     type: 'setCateOI',
                      //     payload: cate
                      //   })
                      // }}
                    >
                      <div
                        className={`pb-1 static w-full flex justify-end ${
                          selBarFoldingState === 2 && canvasCtx.cateOI !== cate
                            ? 'hidden'
                            : ''
                        }`}
                      >
                        <div
                          className={`absolute left-0 transform -translate-x-6 md:-translate-x-8 ${
                            canvasCtx.isDrawing || canvasCtx.cateOI !== cate
                              ? 'invisible'
                              : 'visible'
                          }`}
                          // onClick={(evt) => {
                          //   evt.preventDefault()
                          //   evt.stopPropagation()
                          //   if (canvasCtx.isDrawing) return
                          //   setCateCandid(canvasCtx.cateOI as string)
                          //   setShowCateEditBar(true)
                          // }}
                        >
                          <CogIcon
                            className={`w-6 h-6 md:w-8 md:h-8 ${
                              showCateEditBar
                                ? 'text-indigo-600'
                                : 'text-gray-700'
                            } `}
                          />
                        </div>
                        <span>{abbr(cate, 7)}</span>
                      </div>
                      <div
                        className={`flex flex-row-reverse w-20 flex-wrap ${
                          selBarFoldingState === 1 && canvasCtx.cateOI !== cate
                            ? 'hidden'
                            : ''
                        } `}
                      >
                        {group.map((anno: any, i_item: number) => (
                          <div
                            key={`item-${i_item}`}
                            className={`h-5 w-5 ${
                              (i_item + 1) % 3 === 0 ? '' : 'ml-1'
                            } ${
                              i_item < 3 ? '' : 'mt-1'
                            } rounded-md flex justify-center items-center ${
                              canvasCtx.objectOI === anno.unique_hash_z
                                ? 'bg-indigo-600 text-gray-100'
                                : 'bg-gray-200'
                            } ${
                              // isTouchScr
                              //   ? ''
                              //   : 'hover:bg-indigo-600 hover:text-gray-100'
                              ''
                            }`}
                            // onClick={(evt) => {
                            //   if (canvasCtx.isDrawing) return
                            //   evt.preventDefault()
                            //   evt.stopPropagation()
                            //   canvasCtxDispatch({
                            //     type: 'setObjectOI',
                            //     payload: {
                            //       category: anno.category,
                            //       unique_hash_z: anno.unique_hash_z
                            //     }
                            //   })
                            // }}
                          >
                            <span>{anno.text_id}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </Draggable>

          <Draggable bounds='parent' handle='#cate_edit_handle'>
            <div
              className={`bg-gray-100 bg-opacity-0 absolute top-2 left-2 visible rounded-md max-h-full flex flex-col items-end text-xs shadow-lg select-none ${
                showCateEditBar ? '' : 'hidden'
              }`}
            >
              <div className='flex rounded-md'>
                <div
                  id='cate_edit_handle'
                  className='relative inline-flex items-center space-x-2 px-2 rounded-l-md text-gray-100 bg-indigo-400'
                >
                  <HandIcon className='h-4 w-4' aria-hidden='true' />
                </div>
                <div className='relative flex items-stretch flex-grow'>
                  <div className='absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none text-gray-600'>
                    <TagIcon className='h-4 w-4' aria-hidden='true' />
                  </div>
                  <input
                    type='text'
                    id='edit-category-bar'
                    className='w-24 md:w-28 border-0 pl-8 pr-0 text-xs focus:outline-none'
                    placeholder={canvasCtx.cateOI || newCategoryName}
                    value={cateCandid}
                    onChange={(evt) => {
                      evt.preventDefault()
                      const value = evt.target.value
                      setCateCandid(value)
                    }}
                  />
                  <div className='group'>
                    <div
                      className='h-full flex items-center bg-white text-gray-600 px-2'
                      onClick={() => {
                        setShowCateListBar(!showCateListBar)
                      }}
                    >
                      {showCateListBar ? (
                        <ChevronUpIcon className='h-4 w-4 transform translate-y-0.5' />
                      ) : (
                        <ChevronDownIcon className='h-4 w-4 transform translate-y-0.5' />
                      )}
                    </div>
                    <div
                      className={`absolute mt-1 left-0 w-full ${
                        showCateListBar ? '' : 'hidden'
                      } flex flex-col bg-gray-100 bg-opacity-0 max-h-64 overflow-scroll rounded-md shadow-lg`}
                    >
                      {
                        // don't inplace sort categories here, otherwise when adding new named category
                        // it may change existed category's color
                        // e.g. add cateA -> cateC -> cateB -> cateE, when adding cateE, sort (A,C,B) here
                        // before aSave() will switch cateC & cateB's color, but canvas box stroke is still
                        // the colors before update, unless call drawObjectsFromState to redraw afterwards
                        // afterall, changing existed colors are not good idea, so don't inplace sort here
                        [...categories]
                          .sort((ca: string, cb: string) => {
                            return ca < cb ? -1 : 1
                          })
                          .map((cate: string, idx: number) => (
                            <div
                              className={`text-xs py-2 w-full rounded-l-md ${
                                cate === cateCandid
                                  ? 'border-l-6 border-indigo-600 px-2.5'
                                  : 'px-4'
                              }`}
                              style={{ backgroundColor: colors[cate] }}
                              key={`cate-${idx}`}
                              onClick={() => {
                                setCateCandid(cate)
                              }}
                            >
                              <span className=''>{cate}</span>
                            </div>
                          ))
                      }
                    </div>
                  </div>
                </div>
                <div className='grid grid-cols-3'>
                  <button
                    className={`relative border-l border-r inline-flex items-center space-x-2 px-2 focus:outline-none bg-gray-100
                  ${
                    canvasCtx.cateOI === cateCandid
                      ? 'text-gray-400'
                      : 'hover:bg-indigo-600 hover:text-gray-100'
                  }`}
                    // onClick={
                    //   canvasCtx.cateOI === cateCandid ? undefined : aSave
                    // }
                  >
                    <CheckIcon className='h-4 w-4' aria-hidden='true' />
                  </button>
                  <button
                    className='relative border-r inline-flex items-center space-x-2 px-2 bg-gray-100 hover:bg-indigo-600 hover:text-gray-100 focus:outline-none'
                    onClick={() => {
                      setShowCateEditBar(false)
                    }}
                  >
                    <XIcon className='h-4 w-4' aria-hidden='true' />
                  </button>
                  <button
                    className={`relative inline-flex items-center space-x-2 px-2 rounded-r-md focus:outline-none bg-gray-100
                                    ${
                                      canvasCtx.cateOI === newCategoryName &&
                                      cateCandid === newCategoryName
                                        ? 'text-gray-400'
                                        : 'hover:bg-indigo-600 hover:text-gray-100'
                                    }`}
                    // onClick={() => {
                    //   if (canvasCtx.cateOI !== cateCandid)
                    //     setCateCandid(canvasCtx.cateOI as string)
                    //   else if (cateCandid !== newCategoryName) aDelete()
                    // }}
                  >
                    {canvasCtx.cateOI === cateCandid ? (
                      <TrashIcon className='h-4 w-4' aria-hidden='true' />
                    ) : (
                      <RefreshIcon className='h-4 w-4' aria-hidden='true' />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </Draggable>
        </div>
      </div>

      <div className='flex justify-center space-x-1 absolute bottom-0 right-1 md:right-1/4'>
        <div
          // onClick={showPrev}
          className={`h-6 w-6 rounded-sm md:h-8 md:w-8 md:rounded-full flex justify-center items-center bg-gray-200 cursor-pointer
                ${
                  imgObj.idxInPage === 1
                    ? 'text-gray-400'
                    : 'hover:bg-indigo-600 hover:text-gray-100'
                }`}
        >
          <ChevronLeftIcon className='h-4 w-4' />
        </div>

        <div
          // onClick={showNext}
          className={`h-6 w-6 rounded-sm md:h-8 md:w-8 md:rounded-full flex justify-center items-center bg-gray-200 cursor-pointer
                ${
                  imgObj.idxInPage === pagingData.length
                    ? 'text-gray-400'
                    : 'hover:bg-indigo-600 hover:text-gray-100'
                }`}
        >
          <ChevronRightIcon className='h-4 w-4' />
        </div>
      </div>

      <div
        className={`flex justify-center space-x-2 absolute bottom-0 ${
          canvasCtx.annotationsVisible ? '' : 'hidden'
        }`}
      >
        <div className='flex justify-center space-x-1'>
          <div
            className={`h-6 w-6 rounded-sm md:h-8 md:w-8 md:rounded-full flex justify-center items-center bg-gray-200 cursor-pointer ${
              canvasCtx.objectOI
                ? 'hover:bg-indigo-600 hover:text-gray-100'
                : 'text-gray-400'
            }`}
            // onClick={canvasCtx.objectOI ? cDelete : undefined}
          >
            <TrashIcon className='h-4 w-4' />
          </div>
          <div
            className={`h-6 w-6 rounded-sm md:h-8 md:w-8 md:rounded-full flex justify-center items-center bg-gray-200 cursor-pointer ${
              canvasCtx.isDrawing ? 'bg-indigo-600 text-gray-100' : ''
            }`}
            // onClick={() => {
            //   canvasCtxDispatch({
            //     type: 'clearObjectOI'
            //   })
            //   canvasCtxDispatch({
            //     type: 'setIsDrawing',
            //     payload: true
            //   })
            // }}
          >
            <PencilIcon className='h-4 w-4' />
          </div>
        </div>

        <div className='flex justify-center space-x-1'>
          <div
            className={`h-6 w-6 rounded-sm md:h-8 md:w-8 md:rounded-full flex justify-center items-center bg-gray-200 cursor-pointer ${
              canUndo
                ? 'hover:bg-indigo-600 hover:text-gray-100'
                : 'text-gray-400'
            }`}
            // onClick={canUndo ? cUndo : undefined}
          >
            <ReplyIcon className='h-4 w-4' />
          </div>
          <div
            className={`h-6 w-6 rounded-sm md:h-8 md:w-8 md:rounded-full flex justify-center items-center bg-gray-200 cursor-pointer ${
              canRedo
                ? 'hover:bg-indigo-600 hover:text-gray-100'
                : 'text-gray-400'
            }
          `}
            // onClick={canRedo ? cRedo : undefined}
          >
            <ReplyIcon className='h-4 w-4 transform -scale-x-1' />
          </div>
        </div>

        <div className='flex justify-center space-x-1'>
          <div
            className={`h-6 w-6 rounded-sm md:h-8 md:w-8 md:rounded-full flex justify-center items-center bg-gray-200 cursor-pointer ${
              canReset
                ? 'hover:bg-indigo-600 hover:text-gray-100'
                : 'text-gray-400'
            }`}
            // onClick={canReset ? cReset : undefined}
          >
            <RefreshIcon className='h-4 w-4' />
          </div>
          <div
            className={`h-6 w-6 rounded-sm md:h-8 md:w-8 md:rounded-full flex justify-center items-center bg-gray-200 cursor-pointer ${
              // canSave
              //   ? 'hover:bg-indigo-600 hover:text-gray-100'
              //   : 'text-gray-400'
              ''
            }`}
            // onClick={canSave ? allSave : undefined}
          >
            <HeavyFloppyIcon />
          </div>
        </div>
      </div>

      <div className='flex justify-center space-x-1 absolute bottom-0 left-1 md:left-1/4'>
        <div
          // onClick={() => {
          //   canvasCtxDispatch({
          //     type: 'setImageOI',
          //     payload: null
          //   })
          // }}
          className='h-6 w-6 rounded-sm md:h-8 md:w-8 md:rounded-full flex justify-center items-center bg-gray-200 cursor-pointer hover:bg-indigo-600 hover:text-gray-100'
        >
          <XIcon className='h-4 w-4' />
        </div>
      </div>
    </div>
  )
}
