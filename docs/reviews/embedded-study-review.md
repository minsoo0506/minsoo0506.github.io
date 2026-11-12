# Embedded Study review

Scope: the 10 retained chapters and their 53 topic lessons, chapter explanations,
worked examples, and five C/C++ code samples. Removed career/project chapters are
not exposed through search or previous/next navigation.

## Corrections

- The C average example previously returned 0 both for failure and a valid zero
  average. It now returns a success flag, validates the 12-bit input range, and
  leaves the output unchanged on failure. Integer division is explicitly noted.
- The tick example now rejects null state and a zero period. Its contract states
  that elapsed time must be less than one complete counter wrap. Updating the
  baseline to `now` is distinguished from a phase-preserving periodic scheduler.
- Linux storage text now distinguishes atomic rename from durable storage and
  includes file fsync, parent-directory fsync, and error handling.

## Checks

- All retained topics have topic-specific explanations; each chapter has an
  in-depth explanation and a worked example. Code is included in five relevant
  chapters, not presented as a complete board firmware project.
- Checked the separation of UART framing and RS-232/RS-485 physical interfaces,
  I2C 7-bit addressing versus address bytes, ACK/NACK, and open-drain pull-ups.
- Reviewed the volatile/atomicity distinction, signed overflow and unsigned
  wraparound, PWM assumptions, ADC resolution versus accuracy, RTOS mutex
  ownership, ISR restrictions, and communication retry semantics.
- Hardware numbers and signal maps are explicitly illustrative. Board-specific
  registers, allowable voltages, kernel versions and RTOS ports still require
  their own datasheets/documentation.

## Reference checks

- GCC volatile access and non-volatile ordering:
  https://gcc.gnu.org/onlinedocs/gcc/Volatiles.html
- NXP I2C specification:
  https://www.nxp.com/docs/en/user-guide/UM10204.pdf
- Linux fsync and directory durability:
  https://man7.org/linux/man-pages/man2/fsync.2.html
- Linux device model:
  https://docs.kernel.org/driver-api/driver-model/overview.html

This is an educational content review, not hardware certification or verification
of firmware on a physical board.

## Sourced expansion

Added 20 explanatory sections across the 10 chapters, each with an inline primary
source and a worked example. The rendered section is filtered by relevant topic
when a specific lesson is selected. Core Concepts and the duplicated introductory
exercise block were removed.

Additional references checked:

- WG14 N1570 (public C11 committee draft), array/pointer and parameter rules.
- GCC Overall Options, preprocessing / compilation / assembly / linking.
- TI SLVA689, pull-up resistance bounds and 30–70% rise-time equation.
- ST AN4776 and ADC measurement recommendations, timer preload and sampling.
- FreeRTOS-Kernel queue.h / semphr.h API documentation, copying and ownership.
- Microchip AT24C256C page-write and acknowledge-polling documentation.
- OASIS MQTT 3.1.1, QoS and retained-message semantics.
- Linux read(2), GNU GDB watchpoints, and git-bisect manuals.

Worked numbers use explicitly stated assumptions; they are not measurements of
this user's board. New content is an original explanation, not copied manual text.
