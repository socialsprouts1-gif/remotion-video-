"use client";
import React from "react";

/** Keeps one broken panel from taking down the whole editor. */
export class ErrorBoundary extends React.Component<{ name: string; children: React.ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch(error: Error) {
    console.error(`[${this.props.name}]`, error);
  }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center text-xs text-ink-300">
        <div className="font-semibold text-rose-300">The {this.props.name} crashed</div>
        <div className="max-w-xs text-ink-400">{this.state.error.message}</div>
        <button className="rounded-md border border-white/10 px-3 py-1 hover:bg-white/5" onClick={() => this.setState({ error: null })}>
          Try again
        </button>
      </div>
    );
  }
}
