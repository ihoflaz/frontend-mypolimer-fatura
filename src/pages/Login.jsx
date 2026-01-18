import React, { useState, useRef, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Typography, Alert, Paper, InputAdornment, IconButton } from '@mui/material';
import { Visibility, VisibilityOff, Person, Lock } from '@mui/icons-material';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere, Box as ThreeBox, Torus } from '@react-three/drei';
import * as THREE from 'three';

// 3D Floating Shapes Component
function FloatingShapes() {
    const groupRef = useRef();

    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
            groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
        }
    });

    const shapes = useMemo(() => {
        const items = [];
        for (let i = 0; i < 15; i++) {
            items.push({
                position: [
                    (Math.random() - 0.5) * 8,
                    (Math.random() - 0.5) * 8,
                    (Math.random() - 0.5) * 8
                ],
                scale: Math.random() * 0.5 + 0.2,
                type: Math.floor(Math.random() * 3),
                speed: Math.random() * 2 + 1,
            });
        }
        return items;
    }, []);

    return (
        <group ref={groupRef}>
            {shapes.map((shape, i) => (
                <Float key={i} speed={shape.speed} rotationIntensity={0.5} floatIntensity={0.5}>
                    {shape.type === 0 && (
                        <Sphere args={[shape.scale, 16, 16]} position={shape.position}>
                            <meshStandardMaterial
                                color={i % 2 === 0 ? "#f8c224" : "#4f81bd"}
                                transparent
                                opacity={0.7}
                                roughness={0.3}
                                metalness={0.8}
                            />
                        </Sphere>
                    )}
                    {shape.type === 1 && (
                        <ThreeBox args={[shape.scale, shape.scale, shape.scale]} position={shape.position}>
                            <meshStandardMaterial
                                color={i % 2 === 0 ? "#4f81bd" : "#f8c224"}
                                transparent
                                opacity={0.6}
                                roughness={0.4}
                                metalness={0.7}
                            />
                        </ThreeBox>
                    )}
                    {shape.type === 2 && (
                        <Torus args={[shape.scale * 0.8, shape.scale * 0.3, 16, 32]} position={shape.position}>
                            <meshStandardMaterial
                                color="#f8c224"
                                transparent
                                opacity={0.8}
                                roughness={0.2}
                                metalness={0.9}
                            />
                        </Torus>
                    )}
                </Float>
            ))}

            {/* Central Large Shape */}
            <Float speed={1} rotationIntensity={1} floatIntensity={1}>
                <Torus args={[1.5, 0.3, 16, 100]} rotation={[Math.PI / 2, 0, 0]}>
                    <meshStandardMaterial
                        color="#f8c224"
                        roughness={0.1}
                        metalness={1}
                        emissive="#f8c224"
                        emissiveIntensity={0.2}
                    />
                </Torus>
            </Float>
        </group>
    );
}

// 3D Scene Component
function Scene3D() {
    return (
        <Canvas
            camera={{ position: [0, 0, 6], fov: 60 }}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
        >
            <ambientLight intensity={0.4} />
            <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4f81bd" />
            <spotLight position={[0, 5, 5]} angle={0.3} penumbra={1} intensity={0.8} color="#f8c224" />
            <FloatingShapes />
        </Canvas>
    );
}

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const result = await login(username, password);
        setLoading(false);
        if (result.success) {
            navigate('/');
        } else {
            setError(result.message);
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                overflow: 'hidden',
            }}
        >
            {/* 3D Animation Section */}
            <Box
                sx={{
                    flex: { xs: '0 0 200px', md: 1 },
                    position: 'relative',
                    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
                    display: { xs: 'none', sm: 'flex' },
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                }}
            >
                <Scene3D />

                {/* Overlay Text */}
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: { sm: 40, md: 60 },
                        left: { sm: 40, md: 60 },
                        zIndex: 10,
                        color: 'white',
                    }}
                >
                    <Typography
                        variant="h3"
                        sx={{
                            fontWeight: 700,
                            mb: 2,
                            background: 'linear-gradient(135deg, #f8c224 0%, #ffd54f 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            fontSize: { sm: '1.75rem', md: '2.5rem' },
                        }}
                    >
                        MY POLİMER
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{
                            opacity: 0.8,
                            maxWidth: 400,
                            fontSize: { sm: '0.875rem', md: '1rem' },
                        }}
                    >
                        Proforma Fatura Yönetim Sistemi
                    </Typography>
                </Box>
            </Box>

            {/* Login Form Section */}
            <Box
                sx={{
                    flex: { xs: 1, md: '0 0 480px' },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: { xs: 3, sm: 4, md: 6 },
                    background: 'linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%)',
                }}
            >
                <Paper
                    elevation={0}
                    sx={{
                        width: '100%',
                        maxWidth: 400,
                        p: { xs: 3, sm: 4 },
                        borderRadius: 4,
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(79, 129, 189, 0.1)',
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
                    }}
                >
                    {/* Mobile Logo */}
                    <Box sx={{ display: { sm: 'none' }, textAlign: 'center', mb: 3 }}>
                        <Typography
                            variant="h4"
                            sx={{
                                fontWeight: 700,
                                background: 'linear-gradient(135deg, #f8c224 0%, #4f81bd 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                        >
                            MY POLİMER
                        </Typography>
                    </Box>

                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 700,
                            mb: 1,
                            color: '#1a1a2e',
                            textAlign: { xs: 'center', sm: 'left' },
                        }}
                    >
                        Hoş Geldiniz
                    </Typography>
                    <Typography
                        variant="body2"
                        sx={{
                            mb: 4,
                            color: 'text.secondary',
                            textAlign: { xs: 'center', sm: 'left' },
                        }}
                    >
                        Devam etmek için giriş yapın
                    </Typography>

                    {error && (
                        <Alert
                            severity="error"
                            sx={{
                                mb: 3,
                                borderRadius: 2,
                                '& .MuiAlert-icon': { alignItems: 'center' },
                            }}
                        >
                            {error}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Kullanıcı Adı"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            sx={{ mb: 2.5 }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Person sx={{ color: 'text.secondary' }} />
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <TextField
                            fullWidth
                            label="Şifre"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            sx={{ mb: 3 }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Lock sx={{ color: 'text.secondary' }} />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge="end"
                                            size="small"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={loading}
                            sx={{
                                py: 1.5,
                                fontSize: '1rem',
                                fontWeight: 600,
                                background: 'linear-gradient(135deg, #f8c224 0%, #ffd54f 100%)',
                                color: '#1a1a2e',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #e6b320 0%, #f0c740 100%)',
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 8px 24px rgba(248, 194, 36, 0.4)',
                                },
                                transition: 'all 0.3s ease',
                            }}
                        >
                            {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
                        </Button>
                    </Box>

                    <Typography
                        variant="caption"
                        sx={{
                            display: 'block',
                            textAlign: 'center',
                            mt: 4,
                            color: 'text.secondary',
                        }}
                    >
                        © 2024 My Polimer. Tüm hakları saklıdır.
                    </Typography>
                </Paper>
            </Box>
        </Box>
    );
};

export default Login;
