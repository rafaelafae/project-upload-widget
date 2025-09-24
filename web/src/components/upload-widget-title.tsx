import { UploadCloud } from 'lucide-react'
import { usePendindUploads } from '../store/uploads'

export function UploadWidgetTitle() {
	const { isThereAnyPendingUpload, globalPercentage } = usePendindUploads()

	return (
		<div className="flex items-center gap-1.5 text-sm font-medium">
			<UploadCloud className="size-4 text-zinc-400" strokeWidth={1.5} />
			{isThereAnyPendingUpload ? (
				<span className="flex items-center gap-1">
					Uploading
					<span className="text-xs text-zinc-400 tabular-nums">
						{globalPercentage}%
					</span>
				</span>
			) : (
				<span>Upload files</span>
			)}
		</div>
	)
}
