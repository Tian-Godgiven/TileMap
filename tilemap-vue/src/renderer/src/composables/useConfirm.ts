import Swal from 'sweetalert2';

export function useConfirm() {
  return {
    confirm: async (message: string): Promise<boolean> => {
      const result = await Swal.fire({
        html: message,
        showCancelButton: true,
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        scrollbarPadding: false
      });
      return result.isConfirmed;
    }
  };
}
