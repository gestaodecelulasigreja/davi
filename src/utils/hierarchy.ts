import { Celula, Usuario, Cargo, RelatorioSemanal } from "../types";

/**
 * Checks recursively if one user is a superior of another.
 */
export function isSuperiorOf(superiorId: string, subordinateId: string, usuarios: Usuario[]): boolean {
  let current = usuarios.find((u) => u.id === subordinateId);
  while (current && current.lider_direto_id) {
    if (current.lider_direto_id === superiorId) return true;
    current = usuarios.find((u) => u.id === current.lider_direto_id);
  }
  return false;
}

/**
 * Returns cells that are visible to the current logged-in user.
 */
export function getVisibleCelulas(celulas: Celula[], currentUser: Usuario, usuarios: Usuario[]): Celula[] {
  // If Master SaaS Admin is not impersonating, see all
  if (currentUser.cargo_atual === Cargo.MasterAdmin) {
    if (!currentUser.igreja_id) return celulas;
  }

  // Filter first by associated church
  const churchCells = celulas.filter((c) => c.igreja_id === currentUser.igreja_id);

  // Pastor and Admin see everything within their church
  if (
    currentUser.cargo_atual === Cargo.PastorPresidente ||
    currentUser.cargo_atual === Cargo.Administrador
  ) {
    return churchCells;
  }

  // Network Leader sees their network's cells
  if (currentUser.cargo_atual === Cargo.LiderRede) {
    return churchCells.filter((c) => c.rede_id === currentUser.rede_id);
  }

  // Kids Network Leader sees kids cells in their network
  if (currentUser.cargo_atual === Cargo.LiderKidsRede) {
    return churchCells.filter(
      (c) => c.rede_id === currentUser.rede_id && c.tipo_celula === "Kids"
    );
  }

  // Supervisors (LiderArea, SupervisorSetor, LiderSupervisor) and lower
  if (
    currentUser.cargo_atual === Cargo.LiderArea ||
    currentUser.cargo_atual === Cargo.SupervisorSetor ||
    currentUser.cargo_atual === Cargo.LiderSupervisor
  ) {
    return churchCells.filter((c) => {
      if (c.supervisor_id === currentUser.id) return true;
      if (c.lider_id === currentUser.id) return true;
      return isSuperiorOf(currentUser.id, c.lider_id, usuarios);
    });
  }

  // Cell leader sees only cells they manage or assist
  return churchCells.filter(
    (c) => c.lider_id === currentUser.id || c.auxiliares.includes(currentUser.id)
  );
}

/**
 * Returns weekly reports visible to the current logged-in user.
 */
export function getVisibleRelatorios(
  relatorios: RelatorioSemanal[],
  celulas: Celula[],
  currentUser: Usuario,
  usuarios: Usuario[]
): RelatorioSemanal[] {
  const visibleCellIds = new Set(getVisibleCelulas(celulas, currentUser, usuarios).map((c) => c.id));
  return relatorios.filter((r) => visibleCellIds.has(r.celula_id));
}

/**
 * Returns users that are visible to the current logged-in user according to hierarchy.
 */
export function getVisibleUsuarios(usuarios: Usuario[], currentUser: Usuario): Usuario[] {
  // If Master SaaS Admin is not impersonating, see all
  if (currentUser.cargo_atual === Cargo.MasterAdmin && !currentUser.igreja_id) {
    return usuarios;
  }

  // Filter first by associated church
  const churchUsers = usuarios.filter((u) => u.igreja_id === currentUser.igreja_id);

  // Pastor and Admin see everything within their church
  if (
    currentUser.cargo_atual === Cargo.PastorPresidente ||
    currentUser.cargo_atual === Cargo.Administrador
  ) {
    return churchUsers;
  }

  // Network Leaders see members of their network and their superior
  if (
    currentUser.cargo_atual === Cargo.LiderRede ||
    currentUser.cargo_atual === Cargo.LiderKidsRede
  ) {
    return churchUsers.filter((u) => {
      if (u.id === currentUser.id) return true;
      if (u.rede_id === currentUser.rede_id) return true;
      if (currentUser.lider_direto_id && u.id === currentUser.lider_direto_id) return true;
      return false;
    });
  }

  // Other supervisors (Area, Sector, Supervisor, Cell) see themselves, direct superior, and subordinates
  return churchUsers.filter((u) => {
    if (u.id === currentUser.id) return true;
    if (currentUser.lider_direto_id && u.id === currentUser.lider_direto_id) return true;
    return isSuperiorOf(currentUser.id, u.id, usuarios);
  });
}
