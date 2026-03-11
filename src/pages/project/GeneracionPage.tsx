import { GeneradorCodigo } from '../../app/components/acciones/generacion/GeneradorCodigo';
export default function GeneracionPage({ project }: { project?: any }) {
  return <GeneradorCodigo project={project} />;
}
