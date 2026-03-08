"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Solicitud {
  id: string;
  titulo: string;
  descripcion: string;
  tipo: string;
  estado: string;
  userEmail: string;
}

export default function SolicitudesPage() {
  const router = useRouter();
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Estados para nueva solicitud
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [tipo, setTipo] = useState("soporte");
  const [mensaje, setMensaje] = useState("");

  // Estados para edición
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [editTitulo, setEditTitulo] = useState("");
  const [editDescripcion, setEditDescripcion] = useState("");
  const [editTipo, setEditTipo] = useState("soporte");

  // 1. Cargar solicitudes al montar el componente
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetchSolicitudes();
  }, [router]);

  const fetchSolicitudes = async () => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    const parsedUser = storedUser ? JSON.parse(storedUser) : null;

    try {
      const res = await fetch("/api/solicitudes", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          role: parsedUser?.role || "",
          userid: parsedUser?.id || "",
        },
      });
      if (!res.ok) throw new Error("Error al cargar datos");
      const data = await res.json();
      setSolicitudes(data.solicitudes || []);
    } catch (err) {
      setError("No se pudieron cargar las solicitudes");
    } finally {
      setLoading(false);
    }
  };

  // 2. Crear solicitud
  const crearSolicitud = async () => {
    setMensaje("");
    setError("");
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    const parsedUser = storedUser ? JSON.parse(storedUser) : null;

    if (!titulo.trim() || !descripcion.trim()) {
      setError("Título y descripción son obligatorios.");
      return;
    }

    try {
      const res = await fetch("/api/solicitudes", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          role: parsedUser?.role || "",
          userid: parsedUser?.id || "",
        },
        body: JSON.stringify({
          titulo,
          descripcion,
          tipo,
          userId: parsedUser?.id,
          userEmail: parsedUser?.email,
        }),
      });

      if (res.ok) {
        setMensaje("Solicitud creada con éxito.");
        setTitulo("");
        setDescripcion("");
        fetchSolicitudes(); // Recarga la lista
      } else {
        setError("Error al crear la solicitud.");
      }
    } catch (err) {
      setError("Error de conexión.");
    }
  };

  // 3. Funciones de Edición
  const iniciarEdicion = (s: Solicitud) => {
    setEditandoId(s.id);
    setEditTitulo(s.titulo);
    setEditDescripcion(s.descripcion);
    setEditTipo(s.tipo);
  };

  const guardarEdicion = async (id: string) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`/api/solicitudes/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          titulo: editTitulo,
          descripcion: editDescripcion,
          tipo: editTipo,
        }),
      });

      if (res.ok) {
        setSolicitudes((prev) =>
          prev.map((s) => (s.id === id ? { ...s, titulo: editTitulo, descripcion: editDescripcion, tipo: editTipo } : s))
        );
        setEditandoId(null);
      }
    } catch (err) {
      setError("Error al actualizar.");
    }
  };

  // 4. Función de Eliminar (La que faltaba)
  const eliminarSolicitud = async (id: string) => {
    if (!confirm("¿Seguro que quieres eliminar esta solicitud?")) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`/api/solicitudes/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setSolicitudes((prev) => prev.filter((s) => s.id !== id));
      }
    } catch (err) {
      setError("Error al eliminar.");
    }
  };

  const cerrarSesion = () => {
    localStorage.clear();
    router.push("/login");
  };

  if (loading) return <div className="p-8 bg-gray-900 min-h-screen text-white text-center">Cargando...</div>;

  return (
    <div className="p-8 bg-gray-900 min-h-screen text-gray-200">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Gestor de Solicitudes</h1>
        <button onClick={cerrarSesion} className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded text-sm transition font-medium text-white">
          Cerrar Sesión
        </button>
      </div>

      {/* Formulario de Creación */}
      <div className="bg-gray-800 border border-gray-700 p-6 rounded-xl mb-10 shadow-xl">
        <h2 className="text-xl font-semibold mb-4 text-gray-100">Nueva Solicitud</h2>
        {mensaje && <p className="text-green-400 mb-3 text-sm">{mensaje}</p>}
        {error && <p className="text-red-400 mb-3 text-sm">{error}</p>}
        
        <input className="w-full p-3 mb-3 rounded bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Título" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
        <textarea className="w-full p-3 mb-3 rounded bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none h-24" placeholder="Descripción" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
        
        <div className="flex gap-4">
          <select className="flex-1 p-3 rounded bg-gray-700 border border-gray-600 outline-none" value={tipo} onChange={(e) => setTipo(e.target.value)}>
            <option value="soporte">Soporte</option>
            <option value="permiso">Permiso</option>
            <option value="requerimiento">Requerimiento</option>
          </select>
          <button onClick={crearSolicitud} className="px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold text-white transition">
            Crear
          </button>
        </div>
      </div>

      {/* Listado */}
      <div className="grid gap-6">
        {solicitudes.length === 0 ? (
          <p className="text-center text-gray-500 italic">No hay solicitudes para mostrar.</p>
        ) : (
          solicitudes.map((s) => (
            <div key={s.id} className="bg-gray-800 border border-gray-700 p-6 rounded-xl shadow-md transition hover:border-gray-500">
              {editandoId === s.id ? (
                <div className="space-y-4">
                  <input className="w-full p-2 rounded bg-gray-700 border border-gray-600" value={editTitulo} onChange={(e) => setEditTitulo(e.target.value)} />
                  <textarea className="w-full p-2 rounded bg-gray-700 border border-gray-600" value={editDescripcion} onChange={(e) => setEditDescripcion(e.target.value)} />
                  <div className="flex gap-2">
                    <button onClick={() => guardarEdicion(s.id)} className="bg-green-600 px-4 py-2 rounded font-bold">Guardar</button>
                    <button onClick={() => setEditandoId(null)} className="bg-gray-600 px-4 py-2 rounded font-bold">Cancelar</button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-xl font-bold text-white">{s.titulo}</h2>
                    <span className="text-xs px-2 py-1 bg-gray-700 rounded-full text-blue-300 uppercase tracking-wider">{s.tipo}</span>
                  </div>
                  <p className="text-gray-400 mb-4">{s.descripcion}</p>
                  <div className="flex justify-between items-center pt-4 border-t border-gray-700">
                    <span className="text-sm font-medium text-yellow-500">Estado: {s.estado}</span>
                    <div className="flex gap-2">
                      <button onClick={() => iniciarEdicion(s)} className="text-sm text-yellow-400 hover:underline">Editar</button>
                      <button onClick={() => eliminarSolicitud(s.id)} className="text-sm text-red-400 hover:underline">Eliminar</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}