export type ReferenceLesson = {
  title: string;
  topics: number[];
  paragraphs: string[];
  example: string;
  source: { label: string; url: string };
};
const c = {
  label: 'WG14 N1570 · C11 공개 위원회 초안 §6.2, §6.3, §6.5, §6.7',
  url: 'https://www.open-std.org/jtc1/sc22/wg14/www/docs/n1570.pdf',
};
const build = {
  label: 'GCC Manual · Overall Options',
  url: 'https://gcc.gnu.org/onlinedocs/gcc/Overall-Options.html',
};
const pullup = {
  label: 'Texas Instruments · SLVA689, Pullup Resistor Calculation',
  url: 'https://www.ti.com/lit/an/slva689/slva689.pdf',
};
const timer = {
  label: 'STMicroelectronics · AN4776, Timer time-base / preload',
  url: 'https://www.st.com/resource/en/application_note/an4776-generalpurpose-timer-cookbook-for-stm32-microcontrollers-stmicroelectronics.pdf',
};
const adc = {
  label: 'STMicroelectronics · ADC measurements recommendations / AN2834',
  url: 'https://wiki.st.com/stm32mcu/wiki/ADC_measurements_recommendations',
};
const i2c = {
  label: 'NXP · UM10204 §3, I²C transfer and acknowledgement',
  url: 'https://www.nxp.com/docs/en/user-guide/UM10204.pdf',
};
const spi = {
  label: 'Analog Devices · Introduction to SPI Interface',
  url: 'https://www.analog.com/en/resources/analog-dialogue/articles/introduction-to-spi-interface.html',
};
const mqtt = {
  label: 'OASIS MQTT 3.1.1 · §3.3, §4.3, §4.4',
  url: 'https://docs.oasis-open.org/mqtt/mqtt/v3.1.1/os/mqtt-v3.1.1-os.html',
};
export const referenceLessons: Record<string, ReferenceLesson[]> = {
  programming: [
    {
      title: '배열의 크기와 포인터의 크기가 다른 이유',
      topics: [1, 2, 3, 4, 6],
      paragraphs: [
        '배열 객체에는 원소들이 실제로 포함되지만 포인터 객체에는 다른 객체를 가리키는 값이 저장됩니다. sizeof는 값을 따라가서 원래 버퍼 크기를 알아내는 연산이 아닙니다. 또한 함수 매개변수에 쓰인 배열 선언은 포인터 형태로 조정됩니다. 이 때문에 호출하는 쪽의 배열과 함수 안의 매개변수에 같은 sizeof 표현식을 써도 결과의 의미가 다릅니다.',
        '포인터 연산으로 배열의 마지막 바로 다음 위치를 만들 수는 있지만 그 위치를 역참조할 수는 없습니다. 순회 루프의 종료 위치로 사용되는 포인터와 읽을 수 있는 원소의 주소를 구분하세요. 크기를 받는 API도 호출자가 실제 저장 공간과 맞지 않는 길이를 전달하면 안전성을 자동으로 보장하지 못합니다.',
      ],
      example:
        'uint16_t values[4]의 전체 크기는 4 × sizeof(uint16_t)입니다. 함수 인수 values가 uint16_t *로 전달된 후 sizeof(values)를 계산하면 포인터 크기입니다. 따라서 read_values(values, 4)처럼 원소 개수를 별도로 전달하고 i < count 조건으로 접근합니다.',
      source: c,
    },
    {
      title: '컴파일 오류와 링크 오류를 분리해서 찾기',
      topics: [0, 5],
      paragraphs: [
        'GCC의 -E는 전처리 결과까지만 만들고, -S는 어셈블리까지, -c는 목적 파일까지 생성합니다. 실행 파일은 마지막 링크 단계에서 여러 목적 파일과 라이브러리를 결합해 만들어집니다. 같은 프로젝트가 “빌드 실패”로 보이더라도 실패한 단계가 다르면 확인할 입력도 달라집니다.',
        '헤더에 함수 선언이 있으면 컴파일러가 호출 형식을 검사할 수 있지만, 그 선언이 함수 본문을 실행 파일에 넣어 주지는 않습니다. 링크 명령에 구현 목적 파일이 빠지면 참조를 해결하지 못합니다. 반대로 문법이나 타입 오류는 목적 파일이 만들어지기 전에 발견됩니다. 진단 메시지의 첫 오류와 실제 실행된 명령을 함께 보세요.',
      ],
      example:
        'main.c가 sensor_read()를 호출하고 sensor.c에 구현이 있다면 gcc -c main.c와 gcc -c sensor.c를 각각 수행한 뒤 두 목적 파일을 링크합니다. MCU에서는 여기에 시작 코드와 대상 링커 설정이 필요하므로 호스트 명령을 그대로 보드 빌드에 대입하지 않습니다.',
      source: build,
    },
  ],
  electronics: [
    {
      title: '풀업 저항은 작은 값일수록 좋은 것이 아닙니다',
      topics: [0, 1, 3, 4],
      paragraphs: [
        '오픈드레인 출력은 LOW를 만들 때 버스를 기준점으로 끌어내립니다. 이때 풀업 저항이 너무 작으면 출력 소자가 감당해야 하는 전류가 커집니다. 최소 저항은 대략 (VCC − VOL,max) / IOL로 제한됩니다. 여기서 VOL,max와 IOL은 실제 장치가 보장하는 LOW 전압과 싱크 전류 조건을 사용해야 합니다.',
        '3.3 V 전원, 허용 LOW 전압 0.4 V, 싱크 전류 3 mA라는 계산용 조건에서는 최소값이 약 967 Ω입니다. 470 Ω을 사용하면 더 강하게 HIGH로 끌어올리지만 LOW 구동 요구를 넘을 수 있습니다. 장치 수가 늘어 병렬 풀업이 추가되는 경우에도 실제 합성 저항으로 계산해야 합니다.',
      ],
      example:
        '4.7 kΩ 두 개가 같은 레일에 병렬로 연결되면 합성값은 2.35 kΩ입니다. 모듈마다 풀업이 달려 있다면 회로도의 각 저항이 아니라 버스 전체의 합성값을 확인하세요. 위 수치는 원리를 설명하기 위한 가정이며 특정 보드의 권장값은 아닙니다.',
      source: pullup,
    },
    {
      title: '버스 용량이 증가하면 HIGH 복귀가 느려지는 과정',
      topics: [2, 5],
      paragraphs: [
        '출력 소자가 LOW 구동을 해제하면 풀업이 버스의 기생 용량을 충전합니다. 따라서 HIGH로 즉시 뛰는 이상적인 직선이 아니라 RC 충전 곡선이 생깁니다. TI의 I²C 풀업 계산에서는 30%에서 70%까지의 상승 시간을 약 0.8473 × R × C로 표현합니다. 허용 상승 시간이 작을수록 저항의 최대값도 작아집니다.',
        '계산용 조건으로 버스 용량 100 pF, 허용 상승 시간 300 ns를 놓으면 Rmax는 약 3.54 kΩ입니다. 앞의 최소값과 함께 고려하면 가능한 범위는 약 0.97~3.54 kΩ가 됩니다. 이 범위가 겹치지 않으면 저항 하나만 바꾸어 해결할 수 없으며 버스 용량이나 전기적 구성을 다시 검토해야 합니다.',
      ],
      example:
        '2.2 kΩ과 100 pF의 계산 상승 시간은 약 186 ns입니다. 실제로는 커넥터·배선·입력 핀·측정 프로브가 용량을 더하므로 계산 후 파형을 측정합니다. 저항 공차와 전원 범위까지 포함한 최악 조건도 확인하세요.',
      source: pullup,
    },
  ],
  microcontrollers: [
    {
      title: 'PWM 설정값을 바꾸는 순간에도 타이밍이 중요합니다',
      topics: [0, 2, 6],
      paragraphs: [
        '타이머 카운터가 이미 진행 중일 때 비교값이나 주기값을 즉시 바꾸면 현재 펄스가 예상보다 길거나 짧아질 수 있습니다. preload 기능을 지원하는 타이머는 새 값을 보관했다가 update event에서 실제 비교·주기 동작에 반영할 수 있습니다. “레지스터에 썼다”와 “출력 파형에 적용됐다”는 서로 다른 시점일 수 있습니다.',
        '단순 up-counting 예제에서 주파수는 입력 클록을 분주비와 카운터 주기로 나누어 계산합니다. 그러나 모든 타이머의 클록이 CPU 주파수와 같지는 않고, center-aligned 모드에서는 계수 방식이 바뀝니다. 먼저 해당 타이머의 실제 클록과 모드를 확인한 다음 레지스터 값을 계산해야 합니다.',
      ],
      example:
        '48 MHz 입력을 48분주하고 1000 tick마다 갱신하면 1 kHz입니다. 계산값을 정한 뒤 듀티를 25%에서 75%로 바꾸며 전환 순간의 펄스까지 관찰하세요. 특정 STM32의 preload 비트와 update 조건은 해당 참조 매뉴얼에서 확인합니다.',
      source: timer,
    },
    {
      title: 'ADC 해상도를 높여도 센서가 부정확할 수 있는 이유',
      topics: [4],
      paragraphs: [
        'ADC 입력은 샘플링 구간 동안 내부 저장 용량을 입력 전압으로 충전해야 합니다. 센서나 직렬 저항의 소스 임피던스가 크면 주어진 샘플 시간 안에 충분히 정착하지 못할 수 있습니다. 디지털 결과의 비트 수를 늘리는 것만으로 이 전기적 오차가 사라지지는 않습니다.',
        '샘플 시간을 늘렸을 때 결과가 달라지는지 비교하면 입력 정착 문제를 찾는 단서가 됩니다. 기준 전압, 전원 디커플링, 인접 디지털 신호, 접지와 교정 조건도 함께 점검합니다. 내부 ADC 구조와 허용 소스 임피던스는 칩마다 다르므로 동일한 설정값을 다른 MCU에 그대로 복사하지 않습니다.',
      ],
      example:
        '12비트·3.3 V라는 이상적인 조건에서 1 LSB는 약 0.806 mV입니다. 이는 코드 간격의 계산이며 전체 정확도 보증이 아닙니다. 일정한 입력으로 샘플 시간을 바꿔 평균과 분산을 비교하고, 실제 입력 전압을 독립된 계측기로 함께 확인합니다.',
      source: adc,
    },
  ],
  protocols: [
    {
      title: 'I²C 읽기의 마지막 NACK는 정상 종료 과정입니다',
      topics: [2, 5],
      paragraphs: [
        '바이트 전송 뒤의 9번째 클록은 수신자가 ACK 또는 NACK를 표시하는 구간입니다. 타깃이 데이터를 보내는 읽기에서는 컨트롤러가 수신자이므로 응답 비트를 결정합니다. 계속 읽을 때는 ACK하고 마지막 바이트 뒤에는 NACK한 다음 STOP 또는 필요한 후속 조건을 만듭니다.',
        '따라서 분석기에 보이는 NACK를 모두 오류로 세면 정상 읽기까지 실패로 판정할 수 있습니다. 주소 단계의 NACK인지, 쓰기 데이터의 NACK인지, 읽기의 마지막 컨트롤러 NACK인지 위치를 먼저 확인하세요. repeated START는 버스를 놓지 않고 전송 방향이나 대상을 다시 지정하는 조건입니다.',
      ],
      example:
        '7-bit 주소 0x48의 2바이트 읽기는 개념적으로 S → 0x91 → 타깃 ACK → 첫 바이트 → 컨트롤러 ACK → 두 번째 바이트 → 컨트롤러 NACK → P입니다. 레지스터 주소를 먼저 지정해야 하는 장치는 그 앞에 쓰기 단계가 추가됩니다.',
      source: i2c,
    },
    {
      title: 'SPI 수신에도 송신 동작이 필요한 이유',
      topics: [1],
      paragraphs: [
        'SPI에서는 컨트롤러가 제공하는 클록에 맞춰 양쪽의 데이터가 동시에 이동합니다. 응용 코드의 목적이 “수신”이어도 타깃이 비트를 내보내려면 클록이 필요합니다. 그래서 드라이버가 의미 없는 dummy 데이터를 송신하면서 수신 버퍼를 채우는 형태를 취할 수 있습니다.',
        'CPOL과 CPHA를 맞추는 것에 더해 CS 유지 시간과 프레임 단위를 확인해야 합니다. 명령 뒤에 응답을 읽는 부품에서 CS를 매 바이트마다 올리면 하나의 명령이 여러 전송으로 끊어질 수 있습니다. 타깃이 요구하는 최대 클록, 비트 순서와 dummy cycle 수는 개별 데이터시트의 조건입니다.',
      ],
      example:
        '가상의 ID 읽기 명령이 1바이트이고 응답이 3바이트라면 명령 뒤에도 24개의 클록을 제공해야 합니다. 첫 바이트와 동시에 수신된 값은 응답이 아닐 수 있습니다. 분석기에서는 CS가 유지되는 동안의 MOSI와 MISO를 함께 비교하세요.',
      source: spi,
    },
  ],
  'embedded-c': [
    {
      title: 'volatile 플래그가 앞선 버퍼 쓰기를 공개해 주지는 않습니다',
      topics: [1, 2],
      paragraphs: [
        'GCC 문서는 일반 메모리 접근이 volatile 접근을 기준으로 자동 정렬되지 않는다고 설명합니다. 데이터 버퍼를 채운 다음 volatile ready에 1을 기록하는 코드만으로 다른 실행 주체가 언제나 완성된 버퍼를 본다고 결론낼 수 없습니다. 접근을 제거하지 않는 성질과 데이터 공개 순서를 보장하는 성질을 구분해야 합니다.',
        '해결 방법은 문맥에 따라 다릅니다. C 스레드 간에는 적절한 원자 연산과 메모리 순서, RTOS 태스크 간에는 큐나 동기화 객체, DMA 공유에서는 캐시 및 장치 접근 규칙까지 고려할 수 있습니다. 컴파일러 장벽 하나가 CPU 캐시 일관성이나 DMA 완료까지 대신 보장한다고 생각해서는 안 됩니다.',
      ],
      example:
        'data[0] = value; ready = 1; 형태를 보았다면 “누가 ready를 읽는가?”, “data의 소유권은 언제 넘어가는가?”, “캐시가 있는가?”를 먼저 확인합니다. volatile을 더 붙이는 대신 그 경계에 맞는 동기화 수단을 선택합니다.',
      source: {
        label: 'GCC Manual · When is a Volatile Object Accessed?',
        url: 'https://gcc.gnu.org/onlinedocs/gcc/Volatiles.html',
      },
    },
    {
      title: '커널 코드에서 volatile 대신 전용 접근자를 사용하는 이유',
      topics: [4],
      paragraphs: [
        'Linux 커널의 공유 자료구조는 잠금, 원자 연산, 메모리 장벽 등 커널이 정의한 동시성 도구로 보호해야 합니다. 변수에 volatile을 붙이는 것은 경쟁 조건에 대한 상호 배제나 원자성을 제공하지 않습니다. 커널 문서의 경고는 이런 동시성 문제를 단순한 최적화 문제로 오해하지 말라는 취지입니다.',
        '장치 레지스터는 일반 RAM과 접근 규칙이 다를 수 있어 커널의 장치 I/O 접근자를 사용해야 합니다. 이 설명을 베어메탈 MCU에서 volatile 레지스터 정의가 항상 잘못이라는 뜻으로 일반화하면 안 됩니다. 실행 환경과 아키텍처가 제공하는 규칙 안에서 API를 선택하는 것이 핵심입니다.',
      ],
      example:
        '드라이버가 장치 레지스터를 읽는 작업과 태스크들이 같은 카운터를 증가시키는 작업은 서로 다른 문제입니다. 전자는 장치 접근 규약, 후자는 동시성 보호를 먼저 검토하며 한 가지 한정자로 둘을 모두 해결하려 하지 않습니다.',
      source: {
        label: 'Linux Kernel · volatile-considered-harmful',
        url: 'https://www.kernel.org/doc/html/latest/process/volatile-considered-harmful.html',
      },
    },
  ],
  rtos: [
    {
      title: '큐가 구조체를 복사하는 경우와 포인터를 복사하는 경우',
      topics: [1, 4],
      paragraphs: [
        'FreeRTOS 큐는 생성 시 정한 항목 크기만큼 데이터를 복사합니다. 구조체 크기로 큐를 만들면 구조체 내용이 복사되지만 포인터 크기로 만들면 주소 값만 복사됩니다. 후자는 큰 버퍼 복사를 줄일 수 있지만 원본 데이터의 수명과 수정 권한을 애플리케이션이 관리해야 합니다.',
        '생산자가 지역 배열의 주소를 보낸 뒤 함수에서 빠져나오거나 같은 DMA 버퍼를 다시 사용하면 소비자가 다른 내용을 읽을 수 있습니다. 큐 전송이 성공했다는 사실은 가리키는 버퍼까지 복제됐다는 뜻이 아닙니다. 고정 버퍼 풀과 소유권 반환, 또는 작은 메시지의 값 복사를 설계 선택지로 비교합니다.',
      ],
      example:
        '크기가 16바이트인 Sample을 값으로 보내는 큐와 Sample*를 보내는 큐를 구분하세요. 포인터 큐에서는 소비 완료 후 버퍼를 누가 반환하는지까지 정해야 합니다. 가득 찼을 때 전송 실패를 무시하면 버퍼 누수나 데이터 유실이 생길 수 있습니다.',
      source: {
        label: 'FreeRTOS-Kernel · queue.h, xQueueCreate / xQueueSend',
        url: 'https://github.com/FreeRTOS/FreeRTOS-Kernel/blob/main/include/queue.h',
      },
    },
    {
      title: '뮤텍스의 우선순위 상속은 잠금 설계를 대신하지 않습니다',
      topics: [2],
      paragraphs: [
        'FreeRTOS 뮤텍스는 소유권과 우선순위 상속을 지원합니다. 높은 우선순위 태스크가 낮은 우선순위 소유자의 잠금을 기다리는 동안 소유자의 우선순위를 올려 우선순위 역전을 완화할 수 있습니다. 일반 이진 세마포어는 같은 의미의 소유권과 상속을 제공하지 않습니다.',
        '그러나 상속이 있어도 잘못된 잠금 순서의 교착이나 잠금을 잡은 채 하는 무기한 대기는 해결되지 않습니다. 또한 뮤텍스는 ISR에서 사용하는 도구가 아닙니다. 인터럽트에서 이벤트를 전달하려면 해당 문맥에서 허용되는 FromISR API와 포트의 우선순위 조건을 확인해야 합니다.',
      ],
      example:
        '태스크 A가 SPI 잠금을 가진 채 네트워크 응답을 기다리면 센서 태스크 B도 SPI를 오래 사용하지 못할 수 있습니다. 전송에 필요한 짧은 구간만 잠그고, 외부 대기는 잠금 밖으로 분리할 수 있는지 검토하세요.',
      source: {
        label: 'FreeRTOS-Kernel · semphr.h, xSemaphoreCreateMutex',
        url: 'https://github.com/FreeRTOS/FreeRTOS-Kernel/blob/main/include/semphr.h',
      },
    },
  ],
  hardware: [
    {
      title: 'EEPROM의 페이지 경계를 넘으면 다음 페이지에 이어 쓰이지 않을 수 있습니다',
      topics: [3, 4],
      paragraphs: [
        'Microchip AT24C256C의 page write는 한 페이지 안에서 최대 64바이트를 기록합니다. “64바이트 이하”라는 길이 조건만으로 충분하지 않습니다. 시작 주소가 페이지 중간이면 그 페이지에 남은 공간까지만 한 번에 전송해야 하며 경계를 넘는 전송의 동작은 부품 문서에 따라 처리해야 합니다.',
        '범용 드라이버를 만들 때 페이지 크기를 통신 버퍼 크기와 혼동하지 마세요. 현재 주소에서 페이지 끝까지 남은 길이를 계산하고, 남은 데이터 길이와 비교해 더 작은 양을 보낸 뒤 쓰기 완료를 확인하고 다음 주소로 진행합니다. 이 숫자는 AT24C256C의 예이며 다른 EEPROM이나 Flash에 그대로 적용하지 않습니다.',
      ],
      example:
        '64바이트 페이지에서 주소 0x003E부터 4바이트를 저장한다면 첫 전송은 0x003E~0x003F의 2바이트, 다음 전송은 0x0040~0x0041의 2바이트로 나눕니다. 단순히 4바이트가 64보다 작다는 검사로는 경계 문제를 막지 못합니다.',
      source: {
        label: 'Microchip AT24C128C/AT24C256C · §7.2 Page Write',
        url: 'https://onlinedocs.microchip.com/oxy/GUID-338FB7E8-CF68-4894-B7AB-B95E716C71D4-en-US-3/GUID-EE1346FF-A5FE-4EE8-A6E8-B5A41D33EFF3.html',
      },
    },
    {
      title: '쓰기 명령의 ACK와 내부 저장 완료는 다른 시점입니다',
      topics: [3],
      paragraphs: [
        'AT24C256C는 내부 쓰기 사이클이 진행되는 동안 주소 요청에 ACK하지 않을 수 있습니다. ACK polling은 쓰기 명령을 다시 보내는 것이 아니라 START와 올바른 write 주소 바이트를 보내 장치가 다시 응답할 준비가 됐는지 확인하는 절차입니다. 고정 최악 지연을 매번 기다리는 것보다 빨리 다음 작업으로 넘어갈 수 있습니다.',
        '폴링에는 상한 시간이 필요합니다. 장치가 단선되었거나 전원이 꺼진 상황의 NACK를 “아직 쓰는 중”이라고 무한히 기다리면 시스템이 멈춥니다. 정상 busy, 주소 설정 오류, 버스 문제를 로그와 timeout으로 구분하고 완료 후 실제 데이터 읽기 검증이 필요한지 요구사항에서 결정합니다.',
      ],
      example:
        '첫 page write 뒤에 장치의 최대 쓰기 시간과 통신 여유를 고려한 제한 시간 안에서 ACK를 확인합니다. timeout이면 다음 페이지를 계속 쓰지 말고 오류를 보고합니다. 이 절차는 전원 차단 시 여러 페이지의 원자적 갱신을 보장하지 않습니다.',
      source: {
        label: 'Microchip AT24C256C · §7.3 Acknowledge Polling',
        url: 'https://onlinedocs.microchip.com/oxy/GUID-FEEC2B39-7B05-43C4-AB92-C76A6F28FB70-en-US-2/GUID-0A478C13-C4D9-4697-BE62-320471DCB1DE.html',
      },
    },
  ],
  linux: [
    {
      title: 'read 한 번이 응용 메시지 한 개를 뜻하지 않습니다',
      topics: [0, 1],
      paragraphs: [
        'read(fd, buf, count)의 count는 최대 요청 길이입니다. 반환값이 양수지만 count보다 작아도 그 자체로 오류가 아닙니다. 수신 가능한 데이터 양이나 신호 등 실행 조건에 따라 일부만 읽을 수 있으므로 실제 반환 길이만 소비해야 합니다. -1과 errno는 오류를, 0은 일반 파일이나 스트림 소켓 등의 문맥에서 EOF를 나타낼 수 있습니다.',
        '일반 파일·터미널·장치의 세부 동작을 모두 같은 것으로 취급하면 안 됩니다. 특히 터미널 설정에 따른 0바이트 읽기와 소켓의 연결 종료는 다른 맥락입니다. 비차단 파일에서 EAGAIN을 받은 경우에는 준비 상태를 기다려야 하며 무한 반복으로 CPU를 소모하지 않도록 합니다.',
      ],
      example:
        '20바이트 헤더가 필요한 파서는 7바이트를 읽었다면 나머지 13바이트를 누적해야 합니다. 이미 받은 7바이트를 덮어쓰거나 아직 채워지지 않은 13바이트를 파싱하면 안 됩니다. 상위 길이 필드는 먼저 최대 허용 크기와 비교합니다.',
      source: {
        label: 'Linux man-pages · read(2), RETURN VALUE / ERRORS',
        url: 'https://man7.org/linux/man-pages/man2/read.2.html',
      },
    },
    {
      title: '파일 교체가 원자적이어도 전원 차단 후 보존은 별도 문제입니다',
      topics: [1],
      paragraphs: [
        'fsync는 파일의 수정 내용과 관련 메타데이터를 저장 장치에 동기화합니다. 하지만 파일의 이름을 담는 디렉터리 항목까지 반드시 동기화하는 것은 아닙니다. 파일을 만들거나 rename한 결과의 지속성을 다룰 때는 부모 디렉터리도 별도 동기화해야 할 수 있습니다.',
        '설정 파일을 안전하게 바꾸는 절차는 임시 파일 쓰기, 파일 fsync, 같은 파일 시스템 안에서 rename, 디렉터리 fsync처럼 단계로 생각할 수 있습니다. 어느 단계에서든 실패할 수 있으므로 반환값을 처리해야 합니다. 이 패턴도 저장 장치의 구현 특성이나 파일 시스템의 모든 고장을 무조건 극복하는 보증은 아닙니다.',
      ],
      example:
        'write가 성공한 직후 전원을 끊는 시험과 fsync까지 성공한 뒤 끊는 시험을 구분하세요. 파일이 존재하는지만 확인하지 말고 버전·길이·CRC가 일관된 정상 레코드인지 검증하면 부분 기록을 발견하기 쉽습니다.',
      source: {
        label: 'Linux man-pages · fsync(2), file and directory synchronization',
        url: 'https://man7.org/linux/man-pages/man2/fsync.2.html',
      },
    },
  ],
  iot: [
    {
      title: 'PUBACK를 받았다는 것과 액추에이터가 동작했다는 것은 다릅니다',
      topics: [0, 2],
      paragraphs: [
        'MQTT QoS 1에서는 PUBLISH와 PUBACK를 통해 프로토콜 수준의 전달을 처리하며 중복이 발생할 수 있습니다. 브로커가 메시지를 받아 확인했다고 해서 구독 애플리케이션의 모터 동작이나 데이터베이스 저장까지 완료되었다는 뜻은 아닙니다. 각 계층의 성공 조건을 나눠야 합니다.',
        '명령 처리에는 애플리케이션의 command ID와 결과 메시지를 별도로 설계할 수 있습니다. 같은 ID가 다시 오면 중복 실행 대신 이전 결과를 반환하는 방식이 한 예입니다. 프로세스가 동작 직후 재부팅되는 경우에도 중복을 막아야 한다면 기록의 지속성과 복구 시점까지 설계해야 합니다.',
      ],
      example:
        '“문 열기” 명령을 보낸 뒤 PUBACK만으로 화면을 “열림”으로 바꾸지 않습니다. 장치가 센서나 실행 결과를 확인한 뒤 별도의 상태 응답을 보내게 하고, 응답 지연과 실패를 사용자 상태로 구분합니다. 이는 응용 설계 예시입니다.',
      source: mqtt,
    },
    {
      title: 'retained 메시지는 최근 상태 저장에 유용하지만 명령에는 주의가 필요합니다',
      topics: [2, 3],
      paragraphs: [
        'retained PUBLISH는 토픽의 최근 retained 값을 브로커에 보관해 새 구독자에게 제공할 수 있게 합니다. 오래전에 전송한 동작 명령을 retained로 남기면 나중에 연결한 장치가 그 명령을 다시 받을 수 있습니다. 상태 토픽과 일회성 명령 토픽을 분리해야 하는 이유입니다.',
        'MQTT 3.1.1에서는 새 구독자에게 전달되는 retained 데이터가 응용 관점에서 아직 유효한지 자동 판단해 주지 않습니다. 시각·버전·만료 조건을 payload에서 관리할지 결정하세요. Last Will도 연결 이상 시 브로커가 게시하는 메시지이며 실제 하드웨어의 고장 원인을 증명하는 진단서는 아닙니다.',
      ],
      example:
        '온도 상태에는 retained를 적용할 수 있지만 “즉시 운전 시작” 같은 명령은 별도 정책이 필요합니다. 빈 payload의 retained PUBLISH로 기존 retained 값을 지우는 규칙도 3.1.1에 정의되어 있으므로 운영 절차에서 구분합니다.',
      source: mqtt,
    },
  ],
  tools: [
    {
      title: 'watchpoint로 값을 망가뜨린 명령을 찾기',
      topics: [1, 2],
      paragraphs: [
        '일반 breakpoint는 알고 있는 코드 위치에서 멈추지만 watchpoint는 관심 표현식의 값 변화나 메모리 접근을 관찰합니다. 문제가 발생하는 위치를 모를 때 유용합니다. 하드웨어 watchpoint의 개수와 감시 가능한 범위는 대상이 제공하는 기능에 제한됩니다.',
        'GDB가 소프트웨어 watchpoint를 사용하는 경우에는 실행을 단계적으로 진행하며 값을 검사하기 때문에 매우 느려질 수 있습니다. 따라서 실시간 통신이나 watchdog 동작이 달라질 수 있습니다. “디버거에서는 재현되지 않는다”는 결과가 버그가 없다는 증거는 아니며 측정 방법이 시스템에 준 영향을 확인해야 합니다.',
      ],
      example:
        '예상치 않게 바뀌는 전역 상태에 watch를 걸고, 중단된 위치의 호출 흐름과 쓰기 주체를 확인합니다. 지역 변수는 수명이 끝나면 같은 주소가 다른 용도로 쓰일 수 있으므로 감시 대상의 수명도 함께 고려합니다.',
      source: {
        label: 'GNU GDB Manual · Setting Watchpoints',
        url: 'https://sourceware.org/gdb/current/onlinedocs/gdb.html/Set-Watchpoints.html',
      },
    },
    {
      title: 'git bisect가 유용하려면 재현 판정부터 안정적이어야 합니다',
      topics: [1, 3],
      paragraphs: [
        'git bisect는 정상으로 확인한 커밋과 문제 커밋 사이에서 범위를 줄이며 최초 문제 변경을 찾습니다. 각 중간 버전을 정상 또는 문제로 판단할 수 있어야 하므로 실행 환경과 테스트 입력을 고정하는 일이 먼저입니다. 간헐적 오류를 한 번 실행한 결과만으로 분류하면 잘못된 후보를 가리킬 수 있습니다.',
        '빌드되지 않거나 외부 의존성을 구할 수 없는 버전은 skip으로 건너뛸 수 있습니다. 다만 여러 후보가 남으면 한 커밋으로 확정할 수 없을 수 있습니다. 자동 판정 스크립트는 성공·실패·검사 불가를 구분하는 종료 코드를 사용하고, 검사가 끝나면 bisect 상태를 종료해 원래 작업 흐름으로 돌아갑니다.',
      ],
      example:
        '동일 보드, 동일 센서 입력, 동일 테스트 시간을 사용해 문제가 재현되는 기준을 먼저 만듭니다. 커밋마다 보드 설정 파일이나 툴체인도 달라질 수 있으므로 원인을 소스 한 줄로 성급하게 단정하지 않습니다.',
      source: {
        label: 'Git Documentation · git-bisect',
        url: 'https://git-scm.com/docs/git-bisect',
      },
    },
  ],
};
