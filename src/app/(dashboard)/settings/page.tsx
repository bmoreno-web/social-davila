'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Shield,
  Key,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Building2,
  Users,
  Plus,
  Edit2,
  Trash2,
  UserCheck,
  UserX,
  Mail,
  Lock,
  Sparkles,
  ExternalLink,
  Eye,
  EyeOff,
  Save,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { formatDateSpanish } from '@/lib/utils';

export default function SettingsPage() {
  const [metricoolStatus, setMetricoolStatus] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);

  // Gemini AI State
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [isTestingGemini, setIsTestingGemini] = useState(false);
  const [isSavingGemini, setIsSavingGemini] = useState(false);
  const [geminiStatus, setGeminiStatus] = useState<{ success?: boolean; message?: string; model?: string; error?: string } | null>(null);
  const [geminiSaveMsg, setGeminiSaveMsg] = useState<string | null>(null);

  // Users State
  const [users, setUsers] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState<'ADMIN' | 'TEAM' | 'CLIENT'>('TEAM');
  const [formClientId, setFormClientId] = useState<string>('');
  const [formActive, setFormActive] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userError, setUserError] = useState<string | null>(null);

  const testConnection = async () => {
    setIsTesting(true);
    try {
      const res = await fetch('/api/metricool/test');
      const data = await res.json();
      setMetricoolStatus(data);
    } catch (e: any) {
      setMetricoolStatus({ success: false, message: e.message });
    } finally {
      setIsTesting(false);
    }
  };

  const fetchAiSettings = async () => {
    try {
      const res = await fetch('/api/settings/ai');
      const data = await res.json();
      if (data.apiKey) {
        setGeminiApiKey(data.apiKey);
        setGeminiStatus({ success: true, message: `Clave configurada (Modelo activo: ${data.activeModel || 'gemini-3.6-flash'})` });
      }
    } catch (e) {
      console.error('Error fetching AI settings:', e);
    }
  };

  const testGeminiConnection = async () => {
    if (!geminiApiKey.trim()) {
      setGeminiStatus({ success: false, error: 'Ingresa una clave API de Google Gemini primero' });
      return;
    }
    setIsTestingGemini(true);
    setGeminiStatus(null);
    try {
      const res = await fetch('/api/settings/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test', apiKey: geminiApiKey.trim() })
      });
      const data = await res.json();
      setGeminiStatus(data);
    } catch (e: any) {
      setGeminiStatus({ success: false, error: 'Error de red al conectar con Google' });
    } finally {
      setIsTestingGemini(false);
    }
  };

  const saveGeminiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingGemini(true);
    setGeminiSaveMsg(null);
    try {
      const res = await fetch('/api/settings/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save', apiKey: geminiApiKey.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setGeminiSaveMsg('¡Clave de Google Gemini guardada exitosamente en el servidor!');
        setTimeout(() => setGeminiSaveMsg(null), 3500);
      } else {
        setGeminiStatus({ success: false, error: data.error || 'Error al guardar' });
      }
    } catch (e) {
      setGeminiStatus({ success: false, error: 'Error de conexión' });
    } finally {
      setIsSavingGemini(false);
    }
  };

  const fetchUsersAndClients = async () => {
    setIsLoadingUsers(true);
    try {
      const [usersRes, clientsRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/clients')
      ]);
      const usersData = await usersRes.json();
      const clientsData = await clientsRes.json();

      if (usersData.users) setUsers(usersData.users);
      if (clientsData.clients) setClients(clientsData.clients);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    testConnection();
    fetchAiSettings();
    fetchUsersAndClients();
  }, []);

  const openCreateModal = () => {
    setEditingUserId(null);
    setFormName('');
    setFormEmail('');
    setFormPassword('');
    setFormRole('TEAM');
    setFormClientId(clients[0]?.id || '');
    setFormActive(true);
    setUserError(null);
    setShowModal(true);
  };

  const openEditModal = (user: any) => {
    setEditingUserId(user.id);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormPassword('');
    setFormRole(user.role);
    setFormClientId(user.clientId || (clients[0]?.id || ''));
    setFormActive(user.active);
    setUserError(null);
    setShowModal(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setUserError(null);

    try {
      const url = editingUserId ? `/api/users/${editingUserId}` : '/api/users';
      const method = editingUserId ? 'PUT' : 'POST';

      const payload: any = {
        name: formName,
        email: formEmail,
        role: formRole,
        clientId: formRole === 'CLIENT' ? formClientId : null,
        active: formActive
      };

      if (formPassword && formPassword.trim() !== '') {
        payload.password = formPassword;
      } else if (!editingUserId) {
        setUserError('La contraseña es obligatoria para nuevos usuarios');
        setIsSubmitting(false);
        return;
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al guardar usuario');
      }

      setShowModal(false);
      fetchUsersAndClients();
    } catch (err: any) {
      setUserError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`¿Estás seguro de eliminar al usuario ${userName}?`)) return;

    try {
      const res = await fetch(`/api/users/${userId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchUsersAndClients();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-fadeIn pb-16">
      <div>
        <h1 className="text-2xl font-bold text-white font-display tracking-tight flex items-center gap-2.5">
          <Settings className="h-6 w-6 text-purple-400" /> Configuración & Ajustes del Sistema
        </h1>
        <p className="text-xs text-zinc-400">
          Administración de Inteligencia Artificial (Gemini), usuarios, roles y conexión con Metricool API.
        </p>
      </div>

      {/* 1. MOTOR DE INTELIGENCIA ARTIFICIAL (GOOGLE GEMINI) */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-950/40 via-zinc-900/90 to-zinc-900/60 border border-purple-500/30 space-y-5 shadow-2xl relative overflow-hidden">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-amber-400 flex items-center justify-center text-white shadow-lg shadow-purple-600/30 text-xl font-bold shrink-0">
              ✨
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-white font-display">
                  Motor de Inteligencia Artificial (Google Gemini)
                </h2>
                <Badge variant="purple" className="text-[10px] font-bold">
                  Gemini 3.6 Flash
                </Badge>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Generación de resúmenes ejecutivos, análisis cualitativos y recomendaciones para los informes de clientes.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={saveGeminiKey} className="space-y-4 pt-1">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-zinc-300">
                Google Gemini API Key
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-bold text-purple-400 hover:text-purple-300 hover:underline flex items-center gap-1 transition-colors"
              >
                <span>Obtener API Key en Google AI Studio</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            <div className="relative">
              <input
                type={showGeminiKey ? 'text' : 'password'}
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                placeholder="AQ.Ab8... o AIzaSy..."
                className="w-full pl-4 pr-24 py-2.5 bg-zinc-950/80 border border-zinc-800 focus:border-purple-500/80 rounded-xl text-xs font-mono text-white focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowGeminiKey(!showGeminiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white text-xs font-semibold px-2 py-1 flex items-center gap-1 transition-colors"
              >
                {showGeminiKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                <span>{showGeminiKey ? 'Ocultar' : 'Ver'}</span>
              </button>
            </div>
          </div>

          {/* Real-time Status Alert */}
          {geminiStatus && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-center justify-between gap-3 animate-fadeIn ${
                geminiStatus.success
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-red-500/10 border-red-500/30 text-red-400'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {geminiStatus.success ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
                )}
                <span>{geminiStatus.message || geminiStatus.error}</span>
              </div>
              {geminiStatus.model && (
                <Badge variant="purple" className="text-[10px]">
                  {geminiStatus.model}
                </Badge>
              )}
            </div>
          )}

          {geminiSaveMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="h-4 w-4" />
              <span>{geminiSaveMsg}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-1 flex-wrap gap-3">
            <p className="text-[11px] text-zinc-500">
              ⚡ Compatible con cuota gratuita (Free Tier) y modelos Flash de alta velocidad.
            </p>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="glass"
                size="sm"
                onClick={testGeminiConnection}
                isLoading={isTestingGemini}
                className="text-xs border-zinc-700 text-zinc-300 hover:text-white gap-1.5"
              >
                <Zap className="h-3.5 w-3.5 text-amber-400" />
                <span>Probar Conexión</span>
              </Button>

              <Button
                type="submit"
                size="sm"
                isLoading={isSavingGemini}
                className="bg-purple-600 hover:bg-purple-700 text-white text-xs gap-1.5 shadow-md shadow-purple-600/30"
              >
                <Save className="h-3.5 w-3.5" />
                <span>Guardar Clave</span>
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* 2. GESTIÓN DE USUARIOS */}
      <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 space-y-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Gestión de Usuarios & Roles</h2>
              <p className="text-xs text-zinc-400">
                Crea y administra cuentas de Administradores, Equipo y Clientes
              </p>
            </div>
          </div>

          <Button
            onClick={openCreateModal}
            className="bg-purple-600 hover:bg-purple-700 text-white text-xs gap-1.5 self-start sm:self-auto shadow-md shadow-purple-600/20"
          >
            <Plus className="h-4 w-4" /> Crear Nuevo Usuario
          </Button>
        </div>

        {/* Users Table */}
        <div className="rounded-2xl border border-zinc-800/80 overflow-hidden bg-zinc-950/60">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/90 text-zinc-400 uppercase tracking-wider text-[10px]">
                <th className="p-3.5 font-semibold">Usuario</th>
                <th className="p-3.5 font-semibold">Rol</th>
                <th className="p-3.5 font-semibold">Cliente Asignado</th>
                <th className="p-3.5 font-semibold">Estado</th>
                <th className="p-3.5 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
              {isLoadingUsers ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-zinc-500">
                    Cargando usuarios...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-zinc-500">
                    No hay usuarios registrados.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-white text-[11px] shrink-0">
                          {user.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-white text-xs">{user.name}</p>
                          <p className="text-[10px] text-zinc-500">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5">
                      <Badge
                        variant={
                          user.role === 'ADMIN'
                            ? 'purple'
                            : user.role === 'TEAM'
                            ? 'secondary'
                            : 'gold'
                        }
                        className="text-[10px]"
                      >
                        {user.role}
                      </Badge>
                    </td>

                    <td className="p-3.5">
                      {user.client ? (
                        <span className="font-medium text-white flex items-center gap-1.5">
                          <Building2 className="h-3.5 w-3.5 text-zinc-500" />
                          {user.client.name}
                        </span>
                      ) : (
                        <span className="text-zinc-500 italic">Acceso Global</span>
                      )}
                    </td>

                    <td className="p-3.5">
                      <Badge
                        variant={user.active ? 'success' : 'destructive'}
                        className="text-[9px]"
                      >
                        {user.active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </td>

                    <td className="p-3.5 text-right space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(user)}
                        className="h-7 text-xs text-purple-400 hover:text-purple-300 gap-1"
                      >
                        <Edit2 className="h-3 w-3" /> Editar
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteUser(user.id, user.name)}
                        className="h-7 text-xs text-red-400 hover:text-red-300 gap-1"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. METRICOOL API INTEGRATION STATUS */}
      <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Key className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Motor de Datos: Metricool API</h2>
              <p className="text-xs text-zinc-400">Encapsulado estrictamente en capa de servicio del backend</p>
            </div>
          </div>

          <Button
            variant="glass"
            size="sm"
            onClick={testConnection}
            isLoading={isTesting}
            className="text-xs border-zinc-700 gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isTesting ? 'animate-spin' : ''}`} />
            <span>Verificar Conexión</span>
          </Button>
        </div>

        {metricoolStatus && (
          <div
            className={`p-4 rounded-xl border text-xs flex items-center justify-between gap-3 ${
              metricoolStatus.success
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {metricoolStatus.success ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
              )}
              <div>
                <span className="font-semibold block">{metricoolStatus.message}</span>
                <span className="text-[10px] text-zinc-400">
                  {metricoolStatus.profilesCount} marcas sincronizadas activamente con la agencia
                </span>
              </div>
            </div>
            <Badge variant={metricoolStatus.success ? 'success' : 'destructive'} className="text-[10px]">
              {metricoolStatus.success ? 'TOKEN VÁLIDO' : 'FALLA'}
            </Badge>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-zinc-950/60 border border-zinc-800 text-xs">
          <div>
            <span className="text-[10px] text-zinc-500 block uppercase tracking-wider">Base URL</span>
            <span className="font-mono text-zinc-300">https://app.metricool.com/api</span>
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 block uppercase tracking-wider">Modo de Autenticación</span>
            <span className="font-mono text-zinc-300">Header: X-Mc-Auth (Cifrado servidor)</span>
          </div>
        </div>
      </div>

      {/* 4. AGENCY IDENTITY */}
      <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-950/60 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">Identidad de Agencia</h2>
            <p className="text-xs text-zinc-400">Parámetros corporativos y de marca blanca para informes</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800">
            <span className="text-zinc-500 text-[10px] block mb-1">Nombre Comercial</span>
            <span className="font-bold text-white text-sm">Davila PM — Digital Agency</span>
          </div>
          <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800">
            <span className="text-zinc-500 text-[10px] block mb-1">Contacto Administrativo</span>
            <span className="font-medium text-zinc-200">ddigital@davilaweb.com</span>
          </div>
        </div>
      </div>

      {/* USER CREATE / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div>
              <h2 className="text-lg font-bold text-white font-display">
                {editingUserId ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
              </h2>
              <p className="text-xs text-zinc-400">
                Configura credenciales de acceso y permisos según el rol asignado.
              </p>
            </div>

            {userError && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                {userError}
              </div>
            )}

            <form onSubmit={handleSaveUser} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-zinc-300 font-medium mb-1">Nombre Completo</label>
                <Input
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ej: Carlos Mendoza"
                  className="bg-zinc-950 border-zinc-800 text-white"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Correo Electrónico</label>
                <Input
                  required
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="nombre@empresa.com"
                  className="bg-zinc-950 border-zinc-800 text-white"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">
                  Contraseña {editingUserId && <span className="text-zinc-500">(dejar en blanco para no cambiar)</span>}
                </label>
                <Input
                  type="password"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-zinc-950 border-zinc-800 text-white"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Rol de Acceso</label>
                <select
                  value={formRole}
                  onChange={(e: any) => setFormRole(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-200"
                >
                  <option value="ADMIN">ADMIN — Acceso Total (Administrador de Agencia)</option>
                  <option value="TEAM">TEAM — Equipo / Analista (Gestión y Reportes)</option>
                  <option value="CLIENT">CLIENT — Cliente Final (Solo Portal de su Marca)</option>
                </select>
              </div>

              {formRole === 'CLIENT' && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1.5">
                  <label className="block text-amber-300 font-semibold">Cliente / Marca Asignada</label>
                  <p className="text-[10px] text-amber-400/80">
                    Este usuario solo podrá ver los reportes publicados de esta marca.
                  </p>
                  <select
                    value={formClientId}
                    onChange={(e) => setFormClientId(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white text-xs"
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="userActiveCheck"
                  checked={formActive}
                  onChange={(e) => setFormActive(e.target.checked)}
                  className="rounded border-zinc-700 bg-zinc-950 text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="userActiveCheck" className="text-zinc-300 text-xs select-none">
                  Usuario Activo (Permitir inicio de sesión)
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowModal(false)}
                  className="text-xs text-zinc-400"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  isLoading={isSubmitting}
                  className="bg-purple-600 hover:bg-purple-700 text-white text-xs"
                >
                  {editingUserId ? 'Guardar Cambios' : 'Crear Usuario'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
