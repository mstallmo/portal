import { useState } from "react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { FolderPlusIcon } from "@heroicons/react/16/solid";

type DirectoryPickerProps = {
  setRootDir: (dir: string) => void;
};

export default function DirectoryPicker({ setRootDir }: DirectoryPickerProps) {
  const [open, setOpen] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const dirToOpen = formData.get("directory");

    if (dirToOpen) {
      setRootDir(dirToOpen as string);
    }
  }

  return (
    <div className="h-dvh">
      <div className="px-4 sm:px-6 lg:px-8 min-h-full flex flex-col justify-center items-center">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Open Directory
        </button>
      </div>
      <Dialog open={open} onClose={setOpen} className="relative z-10">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
        />

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel
              transition
              className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg sm:p-6 data-closed:sm:translate-y-0 data-closed:sm:scale-95"
            >
              <form onSubmit={handleSubmit}>
                <div>
                  <div className="text-center">
                    <DialogTitle
                      as="h3"
                      className="text-base font-semibold text-gray-900"
                    >
                      Enter Directory to Open
                    </DialogTitle>
                    <div className="mt-2 sm:mt-5"></div>
                  </div>
                  <div className="mt-3 ">
                    <label htmlFor="directory" className="sr-only">
                      Email
                    </label>
                    <div className="mt-2 grid grid-cols-1">
                      <input
                        id="directory"
                        name="directory"
                        type="text"
                        placeholder="~/Photos"
                        className="col-start-1 row-start-1 block w-full rounded-md bg-white py-1.5 pr-3 pl-10 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:pl-9 sm:text-sm/6"
                      />
                      <FolderPlusIcon
                        aria-hidden="true"
                        className="pointer-events-none col-start-1 row-start-1 ml-3 size-5 self-center text-gray-400 sm:size-4"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                  <button
                    type="submit"
                    onClick={() => setOpen(false)}
                    className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:col-start-2"
                  >
                    Open
                  </button>
                  <button
                    type="button"
                    data-autofocus
                    onClick={() => setOpen(false)}
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 shadow-xs ring-gray-300 ring-inset hover:bg-gray-50 sm:col-start-1 sm:mt-0"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
