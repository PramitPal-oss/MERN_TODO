import { Link } from "react-router-dom";
import type { Post } from "@/types/api";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { UserAvatar } from "@/components/UserAvatar";
import { ArrowRight } from "lucide-react";

export interface PostCardProps {
  post: Post;
}

const formatDate = (value: string) =>
  new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
    new Date(value)
  );

export function PostCard({ post }: PostCardProps) {
  return (
    <Card className="flex flex-col justify-between p-5 transition-shadow hover:shadow-md">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <UserAvatar name={post.author.name} size="sm" />
          <span className="text-sm font-medium text-foreground">
            {post.author.name}
          </span>
          <span className="text-xs text-muted-foreground">·</span>
          <span className="text-xs text-muted-foreground">
            {formatDate(post.createdAt)}
          </span>
        </div>

        <h2 className="text-xl font-bold tracking-tight text-foreground hover:text-primary mb-2">
          <Link to={`/posts/${post.slug}`} className="hover:underline">
            {post.title}
          </Link>
        </h2>

        <p className="text-sm text-muted-foreground line-clamp-3 mb-4 leading-relaxed">
          {post.excerpt}
        </p>
      </div>

      <CardFooter className="p-0 pt-2 flex items-center">
        <Link
          to={`/posts/${post.slug}`}
          className="inline-flex items-center gap-1 text-sm font-semibold text-foreground hover:underline"
        >
          Read story <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </CardFooter>
    </Card>
  );
}
