import * as Progress from '@radix-ui/react-progress'
import { Download, ImageUp, Link2, RefreshCcw, X } from 'lucide-react'
import { motion } from 'motion/react'
import { type Upload, useUploads } from '../store/uploads'
import { formatBytes } from '../utils/format-bytes'
import { Button } from './ui/button'

interface UploadWidgetUploadItemProps {
	upload: Upload
	uploadId: string
}

export function UploadWidgetUploadItem({
	uploadId,
	upload,
}: UploadWidgetUploadItemProps) {
	const cancelUpload = useUploads((store) => store.cancelUpload)

	const progress = Math.min(
		upload.compressedSizeInBytes
			? Math.round(
					(upload.uploadSizeInBytes * 100) / upload.compressedSizeInBytes
				)
			: 0,
		100
	)

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.5 }}
			className="p-3 rounded-lg flex flex-col gap-3 shadow-shape-content bg-white/2 relative overflow-hidden"
		>
			<div className="flex flex-col gap-1">
				<span className="text-xs font-medium flex items-center gap-1">
					{/* File Name */}
					<ImageUp className="size-3 text-zinc-300" strokeWidth={1.5} />
					<span>{upload.name}</span>
				</span>

				<span className="text-xxs text-zinc-400 flex gap-1.5 items-center">
					{/* File total size */}
					<span className="line-through">
						{formatBytes(upload.originalSizeInBytes)}
					</span>
					<div className="size-1 rounded-full bg-zinc-400" />

					<span>
						{/* File remaing size */}
						{formatBytes(upload.compressedSizeInBytes ?? 0)}
						{upload.compressedSizeInBytes && (
							<span className="text-green-400 ml-1">
								-
								{Math.round(
									((upload.originalSizeInBytes - upload.compressedSizeInBytes) *
										100) /
										upload.originalSizeInBytes
								)}
								%
							</span>
						)}
					</span>
					<div className="size-1 rounded-full bg-zinc-400" />
					{/* File remaing uploading percentage */}
					{upload.status === 'success' && <span>100%</span>}
					{upload.status === 'progress' && <span>{progress}%</span>}
					{upload.status === 'error' && (
						<span className="text-red-400">Error</span>
					)}
					{upload.status === 'canceled' && (
						<span className="text-amber-400">Canceled</span>
					)}
				</span>
			</div>

			<Progress.Root
				value={progress}
				data-status={upload.status}
				className="group bg-zinc-800 rounded-full h-1 overflow-hidden"
			>
				<Progress.Indicator
					className="bg-indigo-500 h-1
					group-data-[status=success]:bg-green-400
					group-data-[status=error]:bg-red-400
					group-data-[status=canceled]:bg-amber-400
					"
					style={{
						width: upload.status === 'progress' ? `${progress}%` : '100%',
					}}
				/>
			</Progress.Root>

			<div className="absolute top-2.5 right-2.5 flex items-center gap-1">
				{/* Download the file */}
				<Button
					aria-disabled={upload.status !== 'success'}
					size="icon-sm"
					asChild
				>
					<a href={upload.remoteUrl} download>
						<Download className="size-4" strokeWidth={1.5} />
						<span className="sr-only">Download compressed image</span>
					</a>
				</Button>

				{/* Copy the link file */}
				<Button
					size="icon-sm"
					disabled={!upload.remoteUrl}
					onClick={() =>
						upload.remoteUrl && navigator.clipboard.writeText(upload.remoteUrl)
					}
				>
					<Link2 className="size-4" strokeWidth={1.5} />
					<span className="sr-only">Copy remote URL</span>
				</Button>

				{/* Retry to upload the file */}
				<Button
					disabled={!['canceled', 'error'].includes(upload.status)}
					size="icon-sm"
				>
					<RefreshCcw className="size-4" strokeWidth={1.5} />
					<span className="sr-only">Retry upload</span>
				</Button>

				{/* Cancel the upload file */}
				<Button
					disabled={upload.status !== 'progress'}
					size="icon-sm"
					onClick={() => cancelUpload(uploadId)}
				>
					<X className="size-4" strokeWidth={1.5} />
					<span className="sr-only">Cancel upload</span>
				</Button>
			</div>
		</motion.div>
	)
}
