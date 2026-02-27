"use client";

import Link from "next/link";
import { useEffect } from "react";

import { reportErrorAction } from "@/shared/actions/report-error";
import { routes } from "@/shared/routes";

import styles from "./error-global.module.css";

import type { NextErrorProps } from "@/shared/types/next";

export function ErrorGlobal({ error, reset }: NextErrorProps) {
  // Initialize variables / Setup
  const { message, digest } = error;

  // Effect hooks
  useEffect(() => {
    void reportErrorAction({ message, digest }, { boundary: "global" });
  }, [message, digest]);

  return (
    <div className={styles.root}>
      <div className={styles.container}>
        <div className={styles.number}>500</div>
        <div className={styles.divider} />
        <h1 className={styles.heading}>Something Went Wrong</h1>
        <p className={styles.description}>
          A critical error occurred. Please try again or refresh the page.
        </p>
        <div className={styles.actions}>
          <Link className={styles.buttonOutline} href={routes.root.path()}>
            ⌂ Back to Home
          </Link>
          <button className={styles.buttonSolid} onClick={reset}>
            ↺ Try Again
          </button>
        </div>
      </div>
    </div>
  );
}
