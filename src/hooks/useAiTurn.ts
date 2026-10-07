import { useEffect } from 'react';

/**
 * 人机模式：轮到电脑（thinking=true）时延时执行一步。
 *
 * nonce 一般直接传 state：每次落子后 state 引用变化，effect 重新调度，
 * 因此可支持电脑一个回合内的多次点击（选子→走子、成三后吃子、母鸡连跳）。
 */
export function useAiTurn(thinking: boolean, nonce: unknown, step: () => void, delay = 520) {
  useEffect(() => {
    if (!thinking) return;
    const timer = setTimeout(step, delay);
    return () => clearTimeout(timer);
    // step 每次渲染都会重建，实际由 nonce 变化驱动重新调度
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thinking, nonce]);
}
