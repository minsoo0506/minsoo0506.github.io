export type StudySection = { title: string; text: string };
export type StudyModule = {
  id: string;
  title: string;
  ko: string;
  summary: string;
  sections: StudySection[];
  exercise: string;
  code?: string;
  codeNote?: string;
  language?: string;
  links?: { label: string; url: string }[];
};
export const studyModules: StudyModule[] = [
  {
    id: 'programming',
    title: 'Programming Fundamentals',
    ko: '프로그래밍 기초',
    summary:
      'C의 자료 표현과 메모리 모델을 이해하고, 입력을 안전하게 처리하는 함수부터 작성합니다.',
    sections: [
      {
        title: 'C 언어와 빌드',
        text: '전처리 → 컴파일 → 어셈블 → 링크를 거쳐 실행 파일이 만들어집니다. 선언은 이름과 타입을 알리고 정의는 함수의 본문이나 객체를 실제로 제공합니다.',
      },
      {
        title: '자료형·연산자·제어문',
        text: '정수의 크기와 부호, 승격 규칙을 확인하고 고정 폭이 필요하면 uint32_t 등을 사용합니다. if, switch와 반복문으로 분기하며 배열 경계와 0 나누기, 오버플로에 주의합니다.',
      },
      {
        title: '함수와 재귀',
        text: '함수는 입력과 출력을 명확히 나눕니다. 재귀는 종료 조건이 필수이며 호출마다 스택을 사용하므로 작은 MCU에서는 최대 깊이를 분석해야 합니다.',
      },
      {
        title: '배열·포인터',
        text: '배열은 연속된 객체이고 포인터는 주소를 가리킵니다. 길이를 별도로 전달하며 유효 범위 밖 접근과 수명이 끝난 객체를 가리키는 포인터를 피합니다.',
      },
      {
        title: '구조체·union·enum',
        text: '구조체는 관련 필드를 묶고 enum은 의미 있는 상태 이름을 부여합니다. union은 저장 공간을 공유하므로 현재 사용 중인 표현과 정렬·이식성을 주의해야 합니다.',
      },
      {
        title: '동적 할당과 전처리',
        text: 'malloc/free는 실행 중 메모리를 관리하지만 실패, 누수, 단편화와 실행 시간 변동을 고려해야 합니다. 매크로와 조건부 컴파일은 유용하지만 괄호와 중복 평가에 주의합니다.',
      },
      {
        title: '자료구조·문제 해결',
        text: '링 버퍼, 스택, 큐와 선형 검색의 비용을 비교합니다. 문제를 입력·출력·경계 조건으로 나누고 작은 테스트를 작성한 뒤 구현합니다.',
      },
    ],
    exercise: '고정 크기 센서 샘플 배열의 평균을 계산하고 빈 배열을 안전하게 처리해 보세요.',
    codeNote:
      'C11 예제 · 0도 정상 결과이므로 성공 여부와 평균값을 분리합니다. 입력은 최대 1000개이며 12비트 ADC 범위를 검사합니다. 실패하면 출력값을 변경하지 않습니다.',
    code: `#include <stdbool.h>\n#include <stddef.h>\n#include <stdint.h>\n\nbool average(const uint16_t *samples, size_t n, uint32_t *out) {\n    if (samples == NULL || out == NULL || n == 0 || n > 1000) return false;\n    uint32_t sum = 0;\n    for (size_t i = 0; i < n; ++i) {\n        if (samples[i] > 4095) return false;\n        sum += samples[i];\n    }\n    *out = sum / (uint32_t)n; /* Integer average, rounded down. */\n    return true;\n}`,
  },
  {
    id: 'electronics',
    title: 'Electronics Fundamentals',
    ko: '전자회로 기초',
    summary: '전압·전류·회로 소자와 디지털 논리의 관계를 이해합니다.',
    sections: [
      {
        title: '전기량과 옴의 법칙',
        text: '전압 V, 전류 I, 저항 R은 저항성 소자에서 V = IR 관계를 가집니다. 전력은 P = VI이며 부품의 정격과 발열을 함께 확인합니다.',
      },
      {
        title: 'KCL·KVL',
        text: 'KCL은 한 노드에 들어오는 전류와 나가는 전류의 합을, KVL은 닫힌 경로의 전압 합을 다룹니다. 기준 방향과 극성을 먼저 정하면 부호 오류가 줄어듭니다.',
      },
      {
        title: '저항·커패시터·인덕터',
        text: '저항은 전류를 제한하고 커패시터는 전하를 저장하며 인덕터는 전류 변화에 반응합니다. RC 시간상수 τ = RC는 1차 회로의 응답 속도를 설명합니다.',
      },
      {
        title: '다이오드·트랜지스터',
        text: '다이오드는 방향에 따라 전류 흐름이 달라지고, MOSFET이나 BJT는 적절한 구동 조건에서 스위치로 사용할 수 있습니다. 코일에는 스위치 차단 시 유도 전압을 다룰 보호회로가 필요합니다.',
      },
      {
        title: '아날로그·디지털·논리',
        text: '아날로그는 연속값을, 디지털은 정해진 논리 구간을 다룹니다. 2진수·16진수와 AND/OR/NOT 게이트, 입력 임계값 및 부동 입력을 익힙니다.',
      },
      {
        title: '회로도 읽기',
        text: '전원, 접지, 신호 경로를 먼저 찾고 부품의 방향과 연결점을 추적합니다. 서로 다른 전압 영역과 전류 경로를 확인한 뒤 실제 연결 여부를 판단합니다.',
      },
    ],
    exercise:
      '3.3 V에서 순방향 전압이 2 V인 LED에 5 mA를 흘린다고 가정할 때 저항의 이론값을 구하고, 실제 부품 정격과 허용오차를 확인하세요.',
    links: [
      {
        label: 'Microchip · GPIO와 풀업',
        url: 'https://onlinedocs.microchip.com/oxy/GUID-78D70ED6-D060-4984-8F25-B119A2A89ABB-en-US-3/GUID-5D30D1DD-F533-422F-85F5-B5C4EE00AD86.html',
      },
    ],
  },
  {
    id: 'microcontrollers',
    title: 'Microcontrollers',
    ko: '마이크로컨트롤러',
    summary: 'CPU와 주변장치가 메모리와 클록을 공유하며 외부 장치를 제어하는 방식을 배웁니다.',
    sections: [
      {
        title: 'MCU 아키텍처',
        text: 'MCU는 CPU, 메모리, 클록과 주변장치를 한 칩에 묶습니다. 데이터시트와 참조 매뉴얼에서 메모리 맵, 핀 기능, 전기적 한계를 함께 확인합니다.',
      },
      {
        title: 'GPIO·포트',
        text: '핀을 입력 또는 출력으로 설정하고 필요하면 풀업·풀다운을 사용합니다. 출력 전류 한계와 부팅 시 핀 상태는 MCU와 보드마다 다릅니다.',
      },
      {
        title: '타이머·카운터·PWM',
        text: '타이머는 클록을 세어 주기 이벤트를 만들고 카운터는 외부 이벤트를 셀 수 있습니다. PWM은 주기와 듀티비로 평균 전력을 제어하지만 부하에 맞는 드라이버가 필요합니다.',
      },
      {
        title: '인터럽트',
        text: '인터럽트는 이벤트에 반응해 현재 흐름을 잠시 중단합니다. ISR은 짧게 유지하고 작업은 메인 루프나 태스크로 넘기며 우선순위와 공유 데이터 보호를 설계합니다.',
      },
      {
        title: 'ADC·DAC',
        text: 'ADC는 아날로그 전압을 디지털 코드로 변환하고 DAC는 반대로 출력합니다. 기준 전압, 분해능, 샘플링 시간과 입력 범위가 결과에 영향을 줍니다.',
      },
      {
        title: 'Watchdog Timer · Reset · Clock',
        text: 'watchdog은 정해진 시간 안에 정상적인 갱신이 없으면 시스템을 복구할 수 있습니다. 리셋 원인과 클록 소스·분주비를 기록하고 부팅 시 안전 상태를 설정합니다.',
      },
      {
        title: '개발 보드',
        text: 'Arduino, STM32와 ESP32 보드는 추상화와 주변장치 구성이 다릅니다. 예제를 이식할 때 핀맵, 전압과 SDK 버전을 확인합니다.',
      },
    ],
    exercise:
      '버튼 입력을 주기적으로 읽고 LED 상태를 바꾸는 상태도를 그린 뒤 디바운스 방식을 정해 보세요.',
    codeNote:
      'C11 예제 · uint32_t tick의 모듈러 차이. last 이후 실제 경과 시간이 2^32 tick 미만이어야 합니다. last=now는 실제 호출 시점을 다음 기준으로 삼으므로 고정 위상의 주기 스케줄러와 다릅니다.',
    code: `#include <stdbool.h>\n#include <stdint.h>\n\nbool interval_elapsed(uint32_t now, uint32_t *last, uint32_t period) {\n    if (last == 0 || period == 0) return false;\n    if ((uint32_t)(now - *last) < period) return false;\n    *last = now;\n    return true;\n}\n/* Elapsed time since *last must be less than one full counter wrap. */`,
  },
  {
    id: 'protocols',
    title: 'Communication Protocols',
    ko: '통신 프로토콜',
    summary: '전기적 인터페이스, 프레이밍과 프로토콜을 나눠 보고 측정으로 오류를 좁힙니다.',
    sections: [
      {
        title: 'UART / USART',
        text: 'UART는 비동기 직렬 송수신으로 시작·데이터·선택적 패리티·정지 비트를 사용합니다. 양쪽의 속도와 프레임을 맞추고 TX/RX 연결과 전압 레벨을 확인합니다.',
      },
      {
        title: 'SPI',
        text: '일반적인 SPI는 클록, 데이터 송수신, 칩 선택 신호를 사용합니다. CPOL/CPHA와 비트 순서, 칩 선택 타이밍을 장치 데이터시트에 맞춥니다.',
      },
      {
        title: 'I²C',
        text: 'SDA와 SCL을 공유하고 장치 주소로 통신합니다. 오픈드레인 선에는 적절한 풀업이 필요하며 주소 충돌과 버스 정체를 확인합니다.',
      },
      {
        title: 'CAN',
        text: 'CAN은 메시지 식별자를 이용한 차동 버스입니다. 비트 타이밍, 종단과 오류 상태를 확인하며 애플리케이션 메시지 의미는 상위 프로토콜이나 장치가 정합니다.',
      },
      {
        title: 'USB·Ethernet 기초',
        text: 'USB는 호스트와 장치의 역할, 디스크립터와 엔드포인트를 이해해야 합니다. Ethernet은 프레임과 IP·TCP/UDP 같은 상위 계층을 분리해 봅니다.',
      },
      {
        title: '계층 구분·분석',
        text: 'RS-232/RS-485는 물리 인터페이스이고 Modbus RTU는 직렬 링크에서 사용하는 프로토콜입니다. 로직 분석기로 파형을 캡처해 설정과 바이트를 비교합니다.',
      },
    ],
    exercise:
      '같은 센서 데이터를 UART, SPI, I²C 중 무엇으로 전송할지 선 수, 거리, 주소 지정과 장치 지원을 비교하세요.',
    codeNote: 'C11 예제 · Modbus RTU CRC-16. 길이가 0보다 크면 data는 유효한 버퍼여야 합니다.',
    code: `#include <stddef.h>\n#include <stdint.h>\n\nuint16_t modbus_crc(const uint8_t *data, size_t length) {\n    uint16_t crc = UINT16_C(0xFFFF);\n    for (size_t i = 0; i < length; ++i) {\n        crc ^= data[i];\n        for (unsigned bit = 0; bit < 8; ++bit) {\n            crc = (crc & 1U) ? (uint16_t)((crc >> 1) ^ 0xA001U)\n                             : (uint16_t)(crc >> 1);\n        }\n    }\n    return crc; /* 프레임에는 낮은 바이트부터 전송 */\n}`,
    links: [
      {
        label: 'Analog Devices · UART',
        url: 'https://www.analog.com/en/resources/analog-dialogue/articles/uart-a-hardware-communication-protocol.html',
      },
      { label: 'Modbus 프로토콜', url: 'https://www.modbus.org/introduction-to-modbus' },
    ],
  },
  {
    id: 'embedded-c',
    title: 'Embedded C & System Programming',
    ko: '임베디드 C와 시스템 프로그래밍',
    summary: '하드웨어 접근과 동시성의 경계를 명확히 하며 비트 단위로 상태를 다룹니다.',
    sections: [
      {
        title: '비트 조작',
        text: '마스크와 시프트로 특정 비트를 검사·설정·해제합니다. 시프트 범위와 정수 승격을 확인하고 부호 없는 타입을 사용하는 편이 명확합니다.',
      },
      {
        title: '레지스터·메모리 맵',
        text: '주변장치 레지스터는 정해진 주소나 버스 인터페이스를 통해 접근합니다. 읽기 수정 쓰기는 write-one-to-clear 같은 특수 비트나 동시 접근에 안전하지 않을 수 있습니다.',
      },
      {
        title: 'volatile과 동기화',
        text: 'volatile 접근은 컴파일러가 해당 접근을 제거하거나 합치는 것을 제한하는 데 쓰입니다. 원자성, 스레드 간 동기화, 메모리 순서 또는 하드웨어 장벽을 보장하지 않습니다.',
      },
      {
        title: '인터럽트·저전력',
        text: '공유 상태는 대상 아키텍처에 맞는 원자 연산이나 임계구역을 이용합니다. 슬립 진입 전 이벤트 경합, 클록 복구와 wake-up 소스를 검토합니다.',
      },
      {
        title: '코딩 규칙·최적화',
        text: '타입, 범위, 오류 처리와 정적 분석 규칙을 일관되게 정합니다. 최적화는 측정부터 시작하며 크기·지연·전력과 가독성 사이의 변화를 시험합니다.',
      },
    ],
    exercise:
      '가상의 상태 비트에서 bit 3을 설정하고 나머지 비트를 보존하는 함수를 작성하세요. 실제 레지스터에 적용하기 전 쓰기 동작을 확인하세요.',
    codeNote: 'C 예제 · 일반 메모리 값의 비트 조작. 특정 MCU 레지스터 접근 예제는 아닙니다.',
    code: `#include <stdint.h>\n\nuint32_t set_flag(uint32_t value) {\n    const uint32_t mask = UINT32_C(1) << 3;\n    return value | mask;\n}`,
    links: [
      {
        label: 'GCC · volatile 접근과 메모리 순서',
        url: 'https://gcc.gnu.org/onlinedocs/gcc/Volatiles.html',
      },
      {
        label: 'Linux 커널 · volatile과 동기화',
        url: 'https://www.kernel.org/doc/html/latest/process/volatile-considered-harmful.html',
      },
    ],
  },
  {
    id: 'rtos',
    title: 'RTOS',
    ko: '실시간 운영체제',
    summary: '태스크의 마감 시간과 공유 자원을 고려해 예측 가능한 실행을 설계합니다.',
    sections: [
      {
        title: '실시간과 스케줄링',
        text: '실시간은 단순히 빠르다는 뜻이 아니라 요구된 시간 안에 응답하는 성질입니다. 우선순위, 선점, 주기와 최악 실행 시간을 고려합니다.',
      },
      {
        title: '태스크와 큐',
        text: '태스크는 독립적인 실행 문맥을 갖고 큐는 데이터 또는 메시지를 전달합니다. 큐 용량과 가득 찼을 때 정책을 정의해야 합니다.',
      },
      {
        title: '세마포어·뮤텍스',
        text: '세마포어는 이벤트나 자원 수를 표현할 수 있고 뮤텍스는 상호 배제를 위해 소유권을 가집니다. 우선순위 역전과 데드락을 검토합니다.',
      },
      {
        title: '이벤트 그룹·타이머',
        text: '이벤트 플래그는 여러 조건의 발생을 나타낼 수 있습니다. 소프트웨어 타이머 콜백의 실행 문맥과 지연 가능성을 사용하는 RTOS에서 확인합니다.',
      },
      {
        title: 'ISR과 실습',
        text: '인터럽트에서는 해당 RTOS가 제공하는 ISR 전용 API를 사용하고 긴 작업은 태스크로 전달합니다. FreeRTOS에서는 포트별 인터럽트 우선순위 제한도 확인합니다.',
      },
    ],
    exercise:
      '센서 태스크와 통신 태스크 사이에 큐를 두고 큐가 가득 찼을 때 버릴지 기다릴지 정책을 설계하세요.',
    links: [
      {
        label: 'FreeRTOS · ISR 동기화',
        url: 'https://www.freertos.org/Embedded-RTOS-Binary-Semaphores.html',
      },
    ],
  },
  {
    id: 'hardware',
    title: 'Hardware Interfacing',
    ko: '하드웨어 인터페이스',
    summary: '전압, 전류, 타이밍과 보호를 검토하고 외부 장치를 연결합니다.',
    sections: [
      {
        title: 'LED·버튼',
        text: 'LED에는 적절한 전류 제한이 필요합니다. 버튼에는 풀업 또는 풀다운과 디바운스를 적용하고 active-high/low를 문서화합니다.',
      },
      {
        title: 'LCD·OLED·센서',
        text: '디스플레이의 인터페이스와 전원 요구 사항을 확인합니다. 온습도·IR 센서는 범위, 업데이트 주기, 변환 시간과 보정 조건이 다릅니다.',
      },
      {
        title: '모터·릴레이·드라이버',
        text: 'GPIO가 큰 부하를 직접 구동하지 않도록 적절한 드라이버와 별도 전원을 검토합니다. 코일 보호, 접지, 절연과 부팅 중 안전 상태도 설계합니다.',
      },
      {
        title: 'ADC/DAC·RTC·EEPROM',
        text: '외부 변환기는 기준 전압과 인터페이스 타이밍을 확인합니다. RTC는 전원 유지 방식, EEPROM은 쓰기 수명과 기록 완료 시간을 고려합니다.',
      },
      {
        title: 'SPI Flash·SD 카드',
        text: '비휘발성 저장소의 전원 차단, 페이지·섹터 제한, 파일 시스템 일관성과 오류 복구를 설계합니다.',
      },
    ],
    exercise:
      '3.3 V MCU가 릴레이 코일을 직접 구동할 수 있는지 데이터시트의 전류와 전압 정격으로 판단하고 드라이버 블록을 그려 보세요.',
  },
  {
    id: 'linux',
    title: 'Embedded Linux',
    ko: '임베디드 Linux',
    summary: '프로세스와 장치 드라이버, 빌드 환경을 이해하고 보드에서 진단합니다.',
    sections: [
      {
        title: 'Linux·셸',
        text: '프로세스, 사용자 권한과 표준 입출력을 이해합니다. pwd, ls, cat, grep, journalctl 등은 환경과 권한에 따라 사용 가능 여부가 다릅니다.',
      },
      {
        title: '파일 시스템·프로세스',
        text: '장치 파일, 마운트와 권한을 구분하고 프로세스의 상태·종료 코드를 확인합니다. 전원 손실에 대비해 기록과 복구 정책을 정합니다.',
      },
      {
        title: '드라이버 기초',
        text: '커널 드라이버는 버스와 장치 자원을 관리합니다. 이미 적절한 커널 서브시스템이 있으면 이를 우선 사용하고 GPIO 문자 장치 API는 용도에 맞게 사용합니다.',
      },
      {
        title: '크로스 컴파일·보드',
        text: '빌드 호스트와 대상의 CPU 아키텍처, 툴체인, sysroot와 ABI를 맞춥니다. Raspberry Pi, BeagleBone, Jetson은 각각 운영 환경과 주변장치가 다릅니다.',
      },
    ],
    exercise:
      '대상 보드의 CPU 아키텍처와 커널 버전, 사용 가능한 직렬 장치 파일을 확인하는 절차를 정리하세요.',
    links: [
      {
        label: 'Linux man-pages · fsync와 디렉터리 동기화',
        url: 'https://man7.org/linux/man-pages/man2/fsync.2.html',
      },
      {
        label: 'Linux GPIO 문자 장치 API',
        url: 'https://docs.kernel.org/userspace-api/gpio/chardev.html',
      },
    ],
  },
  {
    id: 'iot',
    title: 'IoT & Connectivity',
    ko: 'IoT와 연결',
    summary: '장치에서 네트워크와 서버까지의 신뢰성·보안을 설계합니다.',
    sections: [
      {
        title: 'IoT 구성',
        text: '센서 수집, 로컬 처리, 네트워크 전송과 서버 저장을 나누어 설계합니다. 연결이 끊겼을 때의 재시도와 데이터 보존 정책이 필요합니다.',
      },
      {
        title: 'Wi-Fi·Bluetooth / BLE',
        text: 'Wi-Fi와 BLE는 전력, 거리, 처리량과 연결 방식이 다릅니다. ESP32 같은 플랫폼은 제공하는 무선 기능과 동시 사용 제약을 확인합니다.',
      },
      {
        title: 'MQTT',
        text: 'MQTT는 브로커와 토픽을 이용한 게시·구독 방식입니다. QoS, 재접속과 중복 수신 가능성을 고려해 수신 처리를 설계합니다.',
      },
      {
        title: '클라우드·보안',
        text: '클라우드 플랫폼 연동 시 장치 인증, 전송 암호화, 키 관리와 펌웨어 업데이트를 계획합니다. 제품별 비용·지원과 데이터 보존 정책도 확인합니다.',
      },
    ],
    exercise:
      '온도 센서가 10분간 오프라인이 된 뒤 재접속할 때 데이터를 어떻게 저장하고 중복 없이 처리할지 설계하세요.',
    language: 'C++17',
    codeNote: 'C++17 예제 · 센서 값의 유효 범위를 확인하는 순수 함수',
    code: `#include <cstdint>\n\nstruct Sample {\n    std::uint32_t sequence;\n    std::int16_t temperature_tenths;\n};\n\nbool valid_temperature(const Sample& sample) {\n    return sample.temperature_tenths >= -400 &&\n           sample.temperature_tenths <= 1250;\n}\n/* 허용 범위는 실제 센서 사양에 맞춰 변경하세요. */`,
  },
  {
    id: 'tools',
    title: 'Tools & Software',
    ko: '도구와 개발 환경',
    summary: '컴파일러, 디버거와 계측기를 함께 사용해 증거를 수집합니다.',
    sections: [
      {
        title: 'IDE·빌드',
        text: 'Keil, STM32CubeIDE, VS Code 등은 프로젝트 구성과 도구 체인이 다릅니다. 컴파일 옵션, 링커 맵과 경고를 확인합니다.',
      },
      {
        title: '디버깅·버전 관리',
        text: '브레이크포인트, 콜스택, 메모리와 레지스터를 관찰합니다. Git으로 변경을 작은 단위로 기록하고 재현 가능한 버전과 설정을 남깁니다.',
      },
      {
        title: 'JTAG·SWD·시리얼',
        text: '디버그 인터페이스는 프로그램 다운로드와 상태 관찰에 쓰입니다. 시리얼 로그는 타이밍에 영향을 줄 수 있으므로 로그량을 관리합니다.',
      },
      {
        title: '시뮬레이터·계측기',
        text: '시뮬레이터는 빠른 실험에 유용하지만 실제 하드웨어의 전기적 특성을 모두 재현하지 않습니다. 오실로스코프는 아날로그 파형, 로직 분석기는 디지털 신호와 프로토콜을 관찰합니다.',
      },
    ],
    exercise: 'I²C 장치가 응답하지 않을 때 전원·배선·주소·파형을 어떤 순서로 확인할지 기록하세요.',
  },
];
