import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, it } from 'vitest';
import { EmbeddedStudyWindow } from '../windows/EmbeddedStudyWindow';
import { studyModules } from '../../data/embedded-study';
import { lessonDetails } from '../../data/embedded-lessons';
beforeEach(() => localStorage.clear());
it('branches into detailed lessons, zooms, and preserves chapter completion', async () => {
  const user = userEvent.setup();
  const view = render(<EmbeddedStudyWindow />);
  expect(
    screen.getByRole('navigation', { name: /roadmap stages/i }).querySelectorAll('.tree-chapter')
  ).toHaveLength(10);
  expect(screen.queryByText('Build & Grow')).not.toBeInTheDocument();
  expect(screen.queryByText(/기초부터 시스템 설계까지/)).not.toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Zoom in' }));
  expect(screen.getByLabelText('Zoom level')).toHaveTextContent('90%');
  await user.click(screen.getByRole('button', { name: 'Programming Fundamentals' }));
  expect(screen.getByRole('heading', { name: 'Programming Fundamentals' })).toBeInTheDocument();
  await user.click(
    within(screen.getByRole('navigation', { name: 'Chapter contents' })).getByRole('button', {
      name: /배열·포인터/,
    })
  );
  expect(screen.getByText(/포인터 자체에 원래 배열의 길이가/)).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: /Mark as complete/ }));
  expect(JSON.parse(localStorage.getItem('embedded-study-progress-v1') ?? '[]')).toContain(
    'programming'
  );
  await user.click(screen.getByRole('button', { name: /Back to roadmap/ }));
  await user.type(screen.getByRole('searchbox'), 'watchdog');
  expect(screen.getByRole('button', { name: 'Microcontrollers ↗' })).toBeInTheDocument();
  view.unmount();
  render(<EmbeddedStudyWindow />);
  expect(JSON.parse(localStorage.getItem('embedded-study-progress-v1') ?? '[]')).toContain(
    'programming'
  );
});
it('has substantive topic-specific material for every leaf in the roadmap', () => {
  for (const m of studyModules) {
    expect(lessonDetails[m.id]).toHaveLength(m.sections.length);
    for (const paragraphs of lessonDetails[m.id]) {
      expect(paragraphs.length).toBeGreaterThanOrEqual(2);
      expect(paragraphs.join('').length).toBeGreaterThan(220);
    }
  }
});
it('shows sourced explanations without repeating Core concepts', async () => {
  const user = userEvent.setup();
  render(<EmbeddedStudyWindow />);
  await user.click(screen.getByRole('button', { name: 'Electronics Fundamentals' }));
  expect(screen.queryByText(/CORE CONCEPTS|핵심 개념 살펴보기/)).not.toBeInTheDocument();
  expect(
    screen.getByRole('heading', { name: '풀업 저항은 작은 값일수록 좋은 것이 아닙니다' })
  ).toBeInTheDocument();
  expect(screen.getAllByRole('link', { name: /Texas Instruments/ })[0]).toHaveAttribute(
    'href',
    'https://www.ti.com/lit/an/slva689/slva689.pdf'
  );
  await user.click(screen.getByRole('button', { name: /Back to roadmap/ }));
  await user.click(screen.getByRole('button', { name: 'Communication Protocols' }));
  await user.click(
    within(screen.getByRole('navigation', { name: 'Chapter contents' })).getByRole('button', {
      name: /03 I²C/,
    })
  );
  expect(
    screen.getByRole('heading', { name: 'I²C 읽기의 마지막 NACK는 정상 종료 과정입니다' })
  ).toBeInTheDocument();
  expect(
    screen.queryByRole('heading', { name: 'SPI 수신에도 송신 동작이 필요한 이유' })
  ).not.toBeInTheDocument();
});
