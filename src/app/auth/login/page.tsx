'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import Logo from '@/components/ui/Logo';
import { useAuth } from '@/components/providers/AuthProvider';
import { useToast } from '@/components/ui/Toast';
import styles from './page.module.css';

export default function LoginPage() {
    const [showPass, setShowPass] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const { logIn, googleSignIn } = useAuth();
    const { showToast } = useToast();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await logIn(email, password);
            showToast('Welcome back! 🎉', 'success');
            router.push('/');
        } catch (err: unknown) {
            const msg =
                err instanceof Error ? err.message.replace('Firebase: ', '') : 'Login failed';
            showToast(msg, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleGoogle = async () => {
        try {
            await googleSignIn();
            showToast('Signed in with Google! 🎉', 'success');
            router.push('/');
        } catch (err: unknown) {
            const msg =
                err instanceof Error ? err.message.replace('Firebase: ', '') : 'Google sign-in failed';
            showToast(msg, 'error');
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.glow} />

            <motion.div
                className={styles.card}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className={styles.header}>
                    <Link href="/" className={styles.logo}>
                        <Logo size={32} /> <span>Swap<span className="gradient-text">Society</span></span>
                    </Link>
                    <h1 className={styles.title}>Welcome Back</h1>
                    <p className={styles.subtitle}>Log in to continue swapping</p>
                </div>

                {/* Google Sign In */}
                <button className={styles.googleBtn} onClick={handleGoogle} type="button">
                    <svg width="18" height="18" viewBox="0 0 24 24">
                        <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                            fill="#4285F4"
                        />
                        <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                        />
                        <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            fill="#FBBC05"
                        />
                        <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335"
                        />
                    </svg>
                    Continue with Google
                </button>

                <div className={styles.divider}>
                    <span>or</span>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <Mail size={16} className={styles.inputIcon} />
                        <input
                            type="email"
                            placeholder="University email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={styles.input}
                            required
                            disabled={submitting}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <Lock size={16} className={styles.inputIcon} />
                        <input
                            type={showPass ? 'text' : 'password'}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={styles.input}
                            required
                            disabled={submitting}
                        />
                        <button
                            type="button"
                            className={styles.togglePass}
                            onClick={() => setShowPass(!showPass)}
                        >
                            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-full btn-lg"
                        disabled={submitting}
                    >
                        {submitting ? (
                            <Loader2 size={18} className="spin" />
                        ) : (
                            <>Log In <ArrowRight size={18} /></>
                        )}
                    </button>
                </form>

                <p className={styles.footer}>
                    Don&apos;t have an account?{' '}
                    <Link href="/auth/signup" className={styles.link}>
                        Sign up
                    </Link>
                </p>
            </motion.div>
        </div>
    );
}
