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
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { formatDateSpanish } from '@/lib/utils';

export default function SettingsPage() {
  const [metricoolStatus, setMetricoolStatus] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);

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
    setFormPassword(''); // leave blank unless changing
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
          <Settings className="h-6 w-6 text-purple-400" /> Configuración & Usuarios
        </h1>
        <p className="text-xs text-zinc-400">
          Administración de usuarios, roles de acceso, seguridad y conexión con Metricool API.
        </p>
      </div>

      {/* GESTIÓN DE USUARIOS */}
      <div className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-5 shadow-xl">
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
            className="bg-purple-600 hover:bg-purple-700 text-white text-xs gap-1.5 self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" /> Crear Nuevo Usuario
          </Button>
        </div>

        {/* Users Table */}
        <div className="rounded-xl border border-zinc-800/80 overflow-hidden bg-zinc-950/60">
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

      {/* METRICOOL API INTEGRATION STATUS */}
      <div className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-4">
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

      {/* AGENCY IDENTITY */}
      <div className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-4">
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
