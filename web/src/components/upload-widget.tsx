import * as Collapsible from '@radix-ui/react-collapsible';
import { UploadWidgetDropzone } from './upload-widget-dropzone';
import { UploadWidgetHeader } from './upload-widget-header';
import { UploadWidgetUploadList } from './upload-widget-upload-list';
import { UploadWidgetMinimizedButton } from './upload-widget-minimized-button';
import { motion, useCycle} from 'motion/react'


export function UploadWidget() {
	const isThereAnyPendingUpload = true

	const [isWidgetOpen, toggleWidgetOpen] = useCycle(false, true);

	return (
		<Collapsible.Root onOpenChange={() => toggleWidgetOpen()} asChild>

			<motion.div 
			data-progress={isThereAnyPendingUpload}
			className="bg-zinc-900 overflow-hidden max-w-[360px] rounded-xl 
			data-[state=open]:shadow-shape
			border border-transparent animate-border-spin 
			data-[state=closed]:rounded-3xl 
			data-[state=closed]:data-[progress=false]:shadow-shape 
			data-[state=closed]:data-[progress=true]:border-gradient"
			animate={isWidgetOpen ? 'open' : 'closed'}
			variants={{
				closed: {
					width: 'max-content',
					height: 44,
					transition: {
						type: 'inertia',
					}
				},
				open: {
					width: 360,
					height: 'auto',
					transition: {
						duration: 0.1,
					}
				},
			}}
			>
				{!isWidgetOpen && <UploadWidgetMinimizedButton />}

				<Collapsible.Content>
					<UploadWidgetHeader />

					<div className="flex flex-col gap-4 py-3">
						<UploadWidgetDropzone />
						<div className="h-px bg-zinc-800 border-t border-black/50 box-content" />
						<UploadWidgetUploadList />
					</div>
				</Collapsible.Content>
			</motion.div>

		</Collapsible.Root>
	);
}
